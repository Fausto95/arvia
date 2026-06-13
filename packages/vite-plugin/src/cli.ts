#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { glob } from "tinyglobby";
import { compile, renderDiagnostic, type ThemeEnv } from "@arviahq/compiler";
import { mirrorPathFor } from "./dts-paths.js";
import { ensureCentralGitignore, sweepDtsDir, writeDtsNow } from "./dts-writer.js";

const USAGE = `Usage: arvia gen [dir] [--theme <path>] [--dts-mode sibling|central] [--dts-dir <dir>] [--src-root <dir>] [--clean] [--storybook|--docs] [--out <dir>] [--include <dirs>] [--format md|json]

Compiles every .arv file under [dir] (default: .) and writes .d.ts declaration
files, so TypeScript can typecheck without running Vite. The theme defaults to
the first file named theme.arv found under [dir].

By default declarations are mirrored into --dts-dir (default .arvia/types,
relative to cwd) under paths relative to --src-root (default src); add
"rootDirs": ["src", ".arvia/types"] to your tsconfig. Use --dts-mode sibling to
write foo.arv.d.ts next to each source file instead. --clean wipes the central
dir first for a hermetic regen.

With --storybook, generates Storybook CSF stories into --out (default: stories/generated/).
With --docs, generates design token documentation (default: docs/tokens/).`;

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const command = args.shift();
  if (command !== "gen") {
    console.error(USAGE);
    return command === "--help" || command === "-h" ? 0 : 1;
  }

  let dir = ".";
  let themeArg: string | undefined;
  let storybook = false;
  let docs = false;
  let outDir = "stories";
  let includeDirs: string[] | undefined;
  let docsFormat: "md" | "json" = "md";
  let dtsMode: "sibling" | "central" = "central";
  let dtsDir = ".arvia/types";
  let srcRoot = "src";
  let clean = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--theme") {
      themeArg = args[++i];
      if (!themeArg) {
        console.error("error: --theme requires a path");
        return 1;
      }
    } else if (args[i] === "--dts-mode") {
      const mode = args[++i];
      if (mode !== "sibling" && mode !== "central") {
        console.error("error: --dts-mode must be sibling or central");
        return 1;
      }
      dtsMode = mode;
    } else if (args[i] === "--dts-dir") {
      dtsDir = args[++i] ?? "";
      if (!dtsDir) {
        console.error("error: --dts-dir requires a path");
        return 1;
      }
    } else if (args[i] === "--src-root") {
      srcRoot = args[++i] ?? "";
      if (!srcRoot) {
        console.error("error: --src-root requires a path");
        return 1;
      }
    } else if (args[i] === "--clean") {
      clean = true;
    } else if (args[i] === "--storybook") {
      storybook = true;
      outDir = "stories/generated";
    } else if (args[i] === "--docs") {
      docs = true;
    } else if (args[i] === "--include") {
      const raw = args[++i];
      if (!raw) {
        console.error("error: --include requires a comma-separated list");
        return 1;
      }
      includeDirs = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (args[i] === "--format") {
      const fmt = args[++i];
      if (fmt !== "md" && fmt !== "json") {
        console.error("error: --format must be md or json");
        return 1;
      }
      docsFormat = fmt;
    } else if (args[i] === "--out") {
      outDir = args[++i] ?? "";
      if (!outDir) {
        console.error("error: --out requires a path");
        return 1;
      }
    } else {
      dir = args[i]!;
    }
  }

  if (docs) {
    const theme = themeArg ?? path.resolve(dir, "src/theme.arv");
    const { generateDocs } = await import("@arviahq/docs");
    const result = generateDocs({
      theme,
      outDir: outDir === "stories" ? "docs/tokens" : outDir,
      format: docsFormat,
    });
    for (const error of result.errors) console.error(error);
    for (const file of result.files) {
      console.log(`generated ${path.relative(process.cwd(), file)}`);
    }
    return result.errors.length > 0 ? 1 : 0;
  }

  if (storybook) {
    const { generateStorybook } = await import("@arviahq/storybook");
    const result = await generateStorybook({
      cwd: path.resolve(dir),
      outDir,
      theme: themeArg,
      includeDirs,
    });
    for (const error of result.errors) console.error(error);
    for (const file of result.files) {
      console.log(`generated ${path.relative(process.cwd(), file)}`);
    }
    return result.errors.length > 0 ? 1 : 0;
  }

  const cwd = path.resolve(dir);
  const files = (
    await glob("**/*.arv", { cwd, absolute: true, ignore: ["**/node_modules/**"] })
  ).toSorted();
  if (files.length === 0) {
    console.error(`no .arv files found under ${cwd}`);
    return 1;
  }

  const themePath = themeArg
    ? path.resolve(themeArg)
    : files.find((f) => path.basename(f) === "theme.arv");

  const centralDir = path.resolve(process.cwd(), dtsDir);
  const sourceRoot = path.resolve(process.cwd(), srcRoot);
  // Declaration target for a `.arv` file: a sibling, or its central mirror
  // (falling back to a sibling when the file lives outside the source root).
  const targetFor = (file: string): string =>
    dtsMode === "central"
      ? (mirrorPathFor({ arvAbsPath: file, sourceRoot, centralDir }) ?? `${file}.d.ts`)
      : `${file}.d.ts`;

  if (dtsMode === "central") {
    if (clean) fs.rmSync(centralDir, { recursive: true, force: true });
    ensureCentralGitignore(centralDir);
  }

  let failed = false;
  let env: ThemeEnv | undefined;
  const written = new Set<string>();

  const generate = (file: string, fileEnv: ThemeEnv | undefined): ThemeEnv | undefined => {
    const result = compile(fs.readFileSync(file, "utf8"), { filename: file, env: fileEnv });
    for (const diagnostic of result.diagnostics) {
      console.error(renderDiagnostic(diagnostic));
      if (diagnostic.severity === "error") failed = true;
    }
    if (result.dts !== null) {
      const target = targetFor(file);
      writeDtsNow(target, result.dts);
      written.add(path.resolve(target));
      console.log(`generated ${path.relative(process.cwd(), target)}`);
    }
    return result.env;
  };

  if (themePath) {
    env = generate(themePath, undefined);
  }
  for (const file of files) {
    if (file === themePath) continue;
    generate(file, env);
  }

  // Mark-and-sweep: the central dir is CLI-owned, so prune any stale mirror
  // left by a prior run for a file that no longer exists.
  if (dtsMode === "central") sweepDtsDir(centralDir, written);

  return failed ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
