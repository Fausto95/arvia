import fs from "node:fs";
import path from "node:path";
import { normalizePath, type Plugin, type ViteDevServer } from "vite";
import {
  compile,
  renderDiagnostic,
  type CompileResult,
  type Diagnostic,
  type ThemeEnv,
} from "@arviahq/compiler";
import { scheduleDtsWrite, writeDtsNow } from "./dts-writer.js";

export interface ArviaOptions {
  /**
   * Path (relative to the Vite root) of the shared theme file whose tokens
   * and recipes are available to every `.arv` file.
   * Defaults to `src/theme.arv` when that file exists.
   */
  theme?: string;
  /**
   * Write sibling `.d.ts` files next to each `.arv` file. Default: false —
   * editor and CLI types come from `@arviahq/typescript-plugin` (tsserver plugin +
   * arvia-tsc) with no files on disk. Enable only as a fallback for setups
   * without the TS plugin; sibling files shadow the virtual types.
   */
  dts?: boolean;
}

const ARV_RE = /.arv$/;
const ARV_CSS_RE = /\.arv\.css$/;

const firstError = (diagnostics: Diagnostic[]) => diagnostics.find((d) => d.severity === "error");

export function arvia(options: ArviaOptions = {}): Plugin {
  let root = process.cwd();
  let isBuild = false;
  let themePath: string | null = null;
  let explicitThemePath: string | null = null;
  let conventionalThemePath = "";
  let themeEnv: ThemeEnv | undefined;
  /** Compiled CSS per .arv file, served through the phantom `<file>.arv.css` module. */
  const cssCache = new Map<string, string>();
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
    const result = compile(source, { filename: themePath, root, sharedEnvFile: true });
    const error = firstError(result.diagnostics);
    if (error) throw new Error(renderDiagnostic(error));
    themeEnv = result.env;
    return themeEnv;
  };

  const compileFile = (id: string, code: string): CompileResult => {
    const isTheme = id === themePath;
    const env = isTheme ? undefined : loadThemeEnv();
    const result = compile(code, { filename: id, root, env, sharedEnvFile: isTheme });
    if (isTheme && !firstError(result.diagnostics)) {
      themeEnv = result.env;
    }
    return result;
  };

  return {
    name: "arvia",
    enforce: "pre",

    configResolved(config) {
      root = config.root;
      isBuild = config.command === "build";
      explicitThemePath = options.theme ? normalizePath(path.resolve(root, options.theme)) : null;
      conventionalThemePath = normalizePath(path.resolve(root, "src/theme.arv"));
      themePath =
        explicitThemePath ?? (fs.existsSync(conventionalThemePath) ? conventionalThemePath : null);
    },

    buildStart() {
      themeEnv = undefined;
      cssCache.clear();
      jsCache.clear();
      componentOwners.clear();
      fileComponents.clear();
      warnedCollisions.clear();
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

        // In sibling-d.ts mode, generate types as soon as the file exists so
        // editors resolve the import before anything loads the module.
        if (options.dts === true) {
          try {
            const result = compileFile(file, fs.readFileSync(file, "utf8"));
            if (!firstError(result.diagnostics)) {
              cssCache.set(file, result.css!);
              jsCache.set(file, result.js!);
              scheduleDtsWrite(`${file}.d.ts`, result.dts!);
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

        // Drop the generated sibling so stale declarations don't shadow
        // anything (and don't outlive their source).
        if (options.dts === true) {
          fs.rmSync(`${file}.d.ts`, { force: true });
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
      if (cached !== undefined) return cached;
      // Cache miss (server restart ordering, programmatic builds): compile from disk.
      const code = fs.readFileSync(arviaPath, "utf8");
      const result = compileFile(arviaPath, code);
      const error = firstError(result.diagnostics);
      if (error) this.error(renderDiagnostic(error));
      cssCache.set(arviaPath, result.css!);
      return result.css!;
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

      cssCache.set(id, result.css!);
      jsCache.set(id, result.js!);
      trackComponents(
        id,
        // Styles share the export namespace, so they collide in imports too.
        [...result.meta.components.map((c) => c.name), ...result.meta.styles.map((s) => s.name)],
        (message) => this.warn(message),
      );
      if (options.dts === true) {
        if (isBuild) writeDtsNow(`${id}.d.ts`, result.dts!);
        else scheduleDtsWrite(`${id}.d.ts`, result.dts!);
      }

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
        cssCache.set(ctx.file, result.css!);
        if (options.dts === true) scheduleDtsWrite(`${ctx.file}.d.ts`, result.dts!);

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
