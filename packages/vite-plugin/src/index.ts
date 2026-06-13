import fs from "node:fs";
import path from "node:path";
import { glob } from "tinyglobby";
import { normalizePath, type Logger, type Plugin, type ViteDevServer } from "vite";
import {
  compile,
  renderDiagnostic,
  type CompileResult,
  type CssSourceMap,
  type Diagnostic,
  type ThemeEnv,
} from "@arviahq/compiler";
import { mirrorPathFor } from "./dts-paths.js";
import {
  ensureCentralGitignore,
  removeDts,
  scheduleDtsWrite,
  sweepDtsDir,
  writeDtsNow,
} from "./dts-writer.js";

/** Where generated `.d.ts` files go. See {@link ArviaOptions.dts}. */
export type DtsMode = "sibling" | "central";

export interface DtsConfig {
  /**
   * `'sibling'` writes `foo.arv.d.ts` next to each source file (resolved by
   * plain `tsc` with no config). `'central'` (default) mirrors them into a
   * single directory the consumer can `.gitignore`. Default: `'central'`.
   */
  mode?: DtsMode;
  /** Central directory, relative to the Vite root. Default: `.arvia/types`. */
  dir?: string;
  /**
   * Source root the central tree mirrors, relative to the Vite root. Must match
   * the first entry of `rootDirs` in the consumer's tsconfig. Default: `src`.
   */
  sourceRoot?: string;
}

export interface ArviaOptions {
  /**
   * Path (relative to the Vite root) of the shared theme file whose tokens
   * and recipes are available to every `.arv` file.
   * Defaults to `src/theme.arv` when that file exists.
   */
  theme?: string;
  /**
   * Emit `.d.ts` files so plain `tsc` (no `arvia-tsc`, no tsserver plugin) can
   * typecheck `.arv` imports.
   *
   * - `'central'` (default, also when omitted) — mirror declarations into
   *   `.arvia/types` (a self-ignoring, generated directory). Requires
   *   `"rootDirs": ["src", ".arvia/types"]` in the consumer's tsconfig.
   * - `true` / `'sibling'` — write `foo.arv.d.ts` next to each source file.
   * - `false` — no files; types come from `@arviahq/typescript-plugin` instead.
   * - object — `'central'` with custom `dir` / `sourceRoot`.
   */
  dts?: boolean | DtsMode | DtsConfig;
}

interface ResolvedDts {
  mode: DtsMode;
  /** Absolute central directory (central mode only). */
  centralDir: string;
  /** Absolute source root (central mode only). */
  sourceRoot: string;
}

/** Normalizes the `dts` option into a resolved config, or `null` when off. */
function resolveDts(dts: ArviaOptions["dts"], root: string): ResolvedDts | null {
  // `false` is the only opt-out; everything else (including `undefined`) emits.
  if (dts === false) return null;
  if (dts === true || dts === "sibling") {
    return { mode: "sibling", centralDir: "", sourceRoot: "" };
  }
  // `undefined` / `'central'` / object → central, the default.
  const config: DtsConfig = dts === undefined || dts === "central" ? {} : dts;
  if ((config.mode ?? "central") === "sibling") {
    return { mode: "sibling", centralDir: "", sourceRoot: "" };
  }
  return {
    mode: "central",
    centralDir: normalizePath(path.resolve(root, config.dir ?? ".arvia/types")),
    sourceRoot: normalizePath(path.resolve(root, config.sourceRoot ?? "src")),
  };
}

const ARV_RE = /.arv$/;
const ARV_CSS_RE = /\.arv\.css$/;

const firstError = (diagnostics: Diagnostic[]) => diagnostics.find((d) => d.severity === "error");

export function arvia(options: ArviaOptions = {}): Plugin {
  let root = process.cwd();
  let isBuild = false;
  let dts: ResolvedDts | null = null;
  let logger: Logger | undefined;
  let hintedRootDirs = false;
  let wroteGitignore = false;
  /** Files outside `sourceRoot` we've already warned fall back to sibling mode. */
  const warnedOutsideRoot = new Set<string>();
  let themePath: string | null = null;
  let explicitThemePath: string | null = null;
  let conventionalThemePath = "";
  let themeEnv: ThemeEnv | undefined;
  /** Compiled CSS per .arv file, served through the phantom `<file>.arv.css` module. */
  const cssCache = new Map<string, { css: string; map: CssSourceMap | null }>();
  /** Last generated JS per .arv file, used to detect style-only edits in HMR. */
  const jsCache = new Map<string, string>();
  /** Component name → defining files, to warn about cross-file name clashes. */
  const componentOwners = new Map<string, Set<string>>();
  const fileComponents = new Map<string, string[]>();
  const warnedCollisions = new Set<string>();

  /** Records a file's component names and reports names defined in more than
   *  one file — importing both into one module forces aliasing, and it is
   *  usually an accidental copy-paste. */
  const trackComponents = (id: string, names: string[], warn: (message: string) => void) => {
    for (const name of fileComponents.get(id) ?? []) {
      componentOwners.get(name)?.delete(id);
    }
    fileComponents.set(id, names);
    for (const name of names) {
      const owners = componentOwners.get(name) ?? new Set<string>();
      owners.add(id);
      componentOwners.set(name, owners);
      if (owners.size > 1) {
        const files = [...owners].map((f) => path.relative(root, f)).toSorted();
        const key = `${name}:${files.join(",")}`;
        if (warnedCollisions.has(key)) continue;
        warnedCollisions.add(key);
        warn(
          `'${name}' is defined in multiple files: ${files.join(", ")} — ` +
            `importing both into one module will require aliasing`,
        );
      }
    }
  };

  const untrackComponents = (id: string) => {
    for (const name of fileComponents.get(id) ?? []) {
      componentOwners.get(name)?.delete(id);
    }
    fileComponents.delete(id);
  };

  const loadThemeEnv = (): ThemeEnv | undefined => {
    if (!themePath) return undefined;
    if (themeEnv) return themeEnv;
    if (!fs.existsSync(themePath)) return undefined;
    const source = fs.readFileSync(themePath, "utf8");
    const result = compile(source, {
      filename: themePath,
      root,
      sharedEnvFile: true,
      minify: isBuild,
    });
    const error = firstError(result.diagnostics);
    if (error) throw new Error(renderDiagnostic(error));
    themeEnv = result.env;
    return themeEnv;
  };

  const compileFile = (id: string, code: string): CompileResult => {
    const isTheme = id === themePath;
    const env = isTheme ? undefined : loadThemeEnv();
    const result = compile(code, { filename: id, root, env, sharedEnvFile: isTheme, minify: isBuild });
    if (isTheme && !firstError(result.diagnostics)) {
      themeEnv = result.env;
    }
    return result;
  };

  /** Declaration path for a `.arv` id, or `null` when dts emission is off. */
  const dtsPathFor = (id: string): string | null => {
    if (!dts) return null;
    if (dts.mode === "sibling") return `${id}.d.ts`;
    const mirror = mirrorPathFor({
      arvAbsPath: id,
      sourceRoot: dts.sourceRoot,
      centralDir: dts.centralDir,
    });
    // Files outside the source root have no sensible mirror: fall back to a
    // sibling so their types still resolve, and say so once.
    if (mirror === null) {
      if (!warnedOutsideRoot.has(id)) {
        warnedOutsideRoot.add(id);
        logger?.warn(
          `[arvia] ${path.relative(root, id)} is outside the dts sourceRoot ` +
            `(${path.relative(root, dts.sourceRoot)}); writing a sibling .d.ts instead.`,
        );
      }
      return `${id}.d.ts`;
    }
    return mirror;
  };

  /** Writes a declaration, dropping the central `.gitignore` on first use. */
  const emitDts = (target: string, content: string, immediate: boolean) => {
    if (dts?.mode === "central" && !wroteGitignore) {
      wroteGitignore = true;
      ensureCentralGitignore(dts.centralDir);
    }
    if (immediate) writeDtsNow(target, content);
    else scheduleDtsWrite(target, content);
  };

  /** One-time nudge: central mode is inert until the consumer adds `rootDirs`. */
  const hintRootDirs = () => {
    if (hintedRootDirs || dts?.mode !== "central") return;
    hintedRootDirs = true;
    try {
      const tsconfig = fs.readFileSync(path.join(root, "tsconfig.json"), "utf8");
      // Already set up, or relying on the tsserver plugin for types: stay quiet.
      if (tsconfig.includes("rootDirs") || tsconfig.includes("@arviahq/typescript-plugin")) return;
    } catch {
      // No tsconfig (or unreadable): hint anyway.
    }
    const dir = path.relative(root, dts.centralDir);
    const src = path.relative(root, dts.sourceRoot);
    logger?.warn(
      `[arvia] writing .d.ts to ${dir}/ — add "rootDirs": ["${src}", "${dir}"] to your ` +
        `tsconfig so tsc resolves .arv imports (or set dts: false to use the TS plugin).`,
    );
  };

  return {
    name: "arvia",
    enforce: "pre",

    configResolved(config) {
      root = config.root;
      isBuild = config.command === "build";
      logger = config.logger;
      dts = resolveDts(options.dts, root);
      explicitThemePath = options.theme ? normalizePath(path.resolve(root, options.theme)) : null;
      conventionalThemePath = normalizePath(path.resolve(root, "src/theme.arv"));
      themePath =
        explicitThemePath ?? (fs.existsSync(conventionalThemePath) ? conventionalThemePath : null);
      hintRootDirs();
    },

    buildStart() {
      themeEnv = undefined;
      cssCache.clear();
      jsCache.clear();
      componentOwners.clear();
      fileComponents.clear();
      warnedCollisions.clear();
      warnedOutsideRoot.clear();
      wroteGitignore = false;
    },

    async buildEnd() {
      // After a build, prune central-dir mirrors whose `.arv` source no longer
      // exists (renames/deletes that happened while nothing was watching).
      if (!isBuild || dts?.mode !== "central") return;
      const files = await glob("**/*.arv", {
        cwd: root,
        absolute: true,
        ignore: ["**/node_modules/**"],
      });
      const keep = new Set<string>();
      for (const file of files) {
        const target = dtsPathFor(normalizePath(file));
        if (target) keep.add(path.resolve(target));
      }
      sweepDtsDir(dts.centralDir, keep);
    },

    configureServer(server: ViteDevServer) {
      const resetAll = () => {
        themeEnv = undefined;
        cssCache.clear();
        jsCache.clear();
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: "full-reload" });
      };

      // `handleHotUpdate` only sees edits to files already in the module
      // graph; brand-new and deleted .arv files arrive through the watcher.
      server.watcher.on("add", (rawFile) => {
        const file = normalizePath(rawFile);
        if (!ARV_RE.test(file)) return;

        // A theme file created mid-session (explicitly configured or the
        // conventional src/theme.arv): activate it and recompile the world.
        if (file === themePath || (!themePath && file === conventionalThemePath)) {
          themePath = file;
          resetAll();
          return;
        }

        // In dts mode, generate types as soon as the file exists so editors
        // resolve the import before anything loads the module.
        if (dts) {
          try {
            const result = compileFile(file, fs.readFileSync(file, "utf8"));
            if (!firstError(result.diagnostics)) {
              cssCache.set(file, { css: result.css!, map: result.cssMap });
              jsCache.set(file, result.js!);
              const target = dtsPathFor(file);
              if (target) emitDts(target, result.dts!, false);
            }
          } catch {
            // Unreadable or theme broken — transform surfaces it on import.
          }
        }
      });

      server.watcher.on("unlink", (rawFile) => {
        const file = normalizePath(rawFile);
        if (!ARV_RE.test(file)) return;
        cssCache.delete(file);
        jsCache.delete(file);
        untrackComponents(file);

        // Drop the generated declaration so stale types don't shadow anything
        // (and don't outlive their source).
        if (dts) {
          const target = dtsPathFor(file);
          if (target) removeDts(target, dts.mode === "central" ? dts.centralDir : undefined);
        }

        if (file === themePath) {
          // An explicitly-configured theme stays configured (it may come
          // back); a deleted conventional theme deactivates.
          if (!explicitThemePath) themePath = null;
          resetAll();
        }
      });
    },

    resolveId(source, importer) {
      if (!ARV_CSS_RE.test(source)) return;
      // Mark the phantom CSS id as resolved so Vite's CSS pipeline owns it
      // (dev injection, build extraction/minification) without touching disk.
      if (path.isAbsolute(source)) {
        // Direct browser requests arrive as root-relative URLs; map them onto
        // the project root when no file exists at the literal path.
        if (!fs.existsSync(source.slice(0, -".css".length))) {
          const rooted = path.join(root, source);
          if (fs.existsSync(rooted.slice(0, -".css".length))) return normalizePath(rooted);
        }
        return source;
      }
      if (importer) return path.resolve(path.dirname(importer), source);
      return source;
    },

    load(id) {
      if (!ARV_CSS_RE.test(id)) return;
      const arviaPath = id.slice(0, -".css".length);
      const cached = cssCache.get(arviaPath);
      if (cached !== undefined) return { code: cached.css, map: cached.map };
      // Cache miss (server restart ordering, programmatic builds): compile from disk.
      const code = fs.readFileSync(arviaPath, "utf8");
      const result = compileFile(arviaPath, code);
      const error = firstError(result.diagnostics);
      if (error) this.error(renderDiagnostic(error));
      cssCache.set(arviaPath, { css: result.css!, map: result.cssMap });
      return { code: result.css!, map: result.cssMap };
    },

    transform(code, id) {
      if (!ARV_RE.test(id)) return;
      const result = compileFile(id, code);

      const error = firstError(result.diagnostics);
      if (error) {
        this.error({
          message: `${error.code}: ${error.message}${error.hint ? ` (hint: ${error.hint})` : ""}`,
          loc: { file: error.file, line: error.line, column: error.col },
        });
      }
      for (const warning of result.diagnostics) {
        if (warning.severity === "warning") this.warn(renderDiagnostic(warning));
      }

      cssCache.set(id, { css: result.css!, map: result.cssMap });
      jsCache.set(id, result.js!);
      trackComponents(
        id,
        // Styles share the export namespace, so they collide in imports too.
        [...result.meta.components.map((c) => c.name), ...result.meta.styles.map((s) => s.name)],
        (message) => this.warn(message),
      );
      const dtsPath = dtsPathFor(id);
      if (dtsPath) emitDts(dtsPath, result.dts!, isBuild);

      // The appended import routes the generated CSS through Vite's pipeline.
      const js = `import ${JSON.stringify(`${id}.css`)};\n${result.js!}`;
      // The generated module is a handful of readable lines; mapping it back
      // to the .arv source would obscure more than it reveals.
      return { code: js, map: null };
    },

    handleHotUpdate(ctx) {
      if (!ARV_RE.test(ctx.file)) return;

      // Token/recipe edits can change every file's output: reset and reload.
      if (ctx.file === themePath) {
        themeEnv = undefined;
        cssCache.clear();
        jsCache.clear();
        ctx.server.moduleGraph.invalidateAll();
        ctx.server.ws.send({ type: "full-reload" });
        return [];
      }

      const cssModule = ctx.server.moduleGraph.getModuleById(`${ctx.file}.css`);
      const jsModules = [...(ctx.server.moduleGraph.getModulesByFile(ctx.file) ?? [])];

      let result: CompileResult | undefined;
      try {
        result = compileFile(ctx.file, fs.readFileSync(ctx.file, "utf8"));
      } catch {
        // Theme failed to compile: let transform surface the error overlay.
      }

      if (result && !firstError(result.diagnostics)) {
        cssCache.set(ctx.file, { css: result.css!, map: result.cssMap });
        const dtsPath = dtsPathFor(ctx.file);
        if (dtsPath) emitDts(dtsPath, result.dts!, false);

        // Style-only edit: class names are path-hashed, so the JS is
        // byte-identical — swap the CSS in place and leave the JS alone.
        if (result.js === jsCache.get(ctx.file) && cssModule) {
          return [cssModule];
        }
        jsCache.set(ctx.file, result.js!);
      } else {
        cssCache.delete(ctx.file);
      }

      return cssModule ? [...jsModules, cssModule] : jsModules;
    },
  };
}

export default arvia;
