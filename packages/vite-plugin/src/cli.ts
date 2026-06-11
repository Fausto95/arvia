#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { glob } from "tinyglobby";
import { compile, renderDiagnostic, type ThemeEnv } from "@arviahq/compiler";
import { writeDtsNow } from "./dts-writer.js";

const USAGE = `Usage: arvia gen [dir] [--theme <path>] [--storybook|--docs] [--out <dir>] [--format md|json]

Compiles every .arv file under [dir] (default: .) and writes the sibling
.d.ts declaration files, so TypeScript can typecheck without running Vite.
The theme defaults to the first file named theme.arv found under [dir].

With --storybook, generates Storybook CSF stories into --out (default: stories/).
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
  let docsFormat: "md" | "json" = "md";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--theme") {
      themeArg = args[++i];
      if (!themeArg) {
        console.error("error: --theme requires a path");
        return 1;
      }
    } else if (args[i] === "--storybook") {
      storybook = true;
    } else if (args[i] === "--docs") {
      docs = true;
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

  let failed = false;
  let env: ThemeEnv | undefined;

  const generate = (file: string, fileEnv: ThemeEnv | undefined): ThemeEnv | undefined => {
    const result = compile(fs.readFileSync(file, "utf8"), { filename: file, env: fileEnv });
    for (const diagnostic of result.diagnostics) {
      console.error(renderDiagnostic(diagnostic));
      if (diagnostic.severity === "error") failed = true;
    }
    if (result.dts !== null) {
      writeDtsNow(`${file}.d.ts`, result.dts);
      console.log(`generated ${path.relative(process.cwd(), file)}.d.ts`);
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

  return failed ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
