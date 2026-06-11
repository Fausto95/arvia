import fs from "node:fs";
import path from "node:path";
import { compile } from "@arviahq/compiler";

export type DocsFormat = "md" | "json";

export interface DocsGenerateOptions {
  theme: string;
  outDir?: string;
  format?: DocsFormat;
}

export interface DocsGenerateResult {
  files: string[];
  errors: string[];
}

function emitMarkdown(tokens: ReturnType<typeof compile>["meta"]["tokens"]): string {
  const groups = new Map<string, typeof tokens>();
  for (const token of tokens) {
    const list = groups.get(token.group) ?? [];
    list.push(token);
    groups.set(token.group, list);
  }

  const lines = ["# Design Tokens", ""];
  for (const [group, entries] of groups) {
    lines.push(`## ${group}`, "");
    lines.push("| Token | CSS variable | Value | Description |");
    lines.push("| --- | --- | --- | --- |");
    for (const entry of entries) {
      const modes = Object.keys(entry.byMode);
      const value =
        modes.length === 1
          ? entry.byMode[modes[0]!]!
          : modes.map((m) => `${m}: ${entry.byMode[m]}`).join("<br>");
      lines.push(`| \`${entry.name}\` | \`${entry.cssVar}\` | ${value} | ${entry.doc ?? ""} |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function generateDocs(options: DocsGenerateOptions): DocsGenerateResult {
  const themePath = path.resolve(options.theme);
  const outDir = path.resolve(path.dirname(themePath), options.outDir ?? "docs/tokens");
  const format = options.format ?? "md";
  const errors: string[] = [];
  const files: string[] = [];

  if (!fs.existsSync(themePath)) {
    return { files, errors: [`theme file not found: ${themePath}`] };
  }

  const result = compile(fs.readFileSync(themePath, "utf8"), {
    filename: themePath,
    root: path.dirname(path.dirname(themePath)),
  });

  for (const d of result.diagnostics) {
    if (d.severity === "error") errors.push(`${themePath}: ${d.message}`);
  }
  if (errors.length > 0) return { files, errors };

  fs.mkdirSync(outDir, { recursive: true });

  if (format === "json") {
    const outPath = path.join(outDir, "tokens.json");
    fs.writeFileSync(outPath, JSON.stringify(result.meta.tokens, null, 2));
    files.push(outPath);
  } else {
    const outPath = path.join(outDir, "tokens.md");
    fs.writeFileSync(outPath, emitMarkdown(result.meta.tokens));
    files.push(outPath);
  }

  return { files, errors };
}
