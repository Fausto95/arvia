#!/usr/bin/env node
/**
 * One-shot helper: wraps doc content string fields with fbt() and exports getDocs().
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/docs/content.ts");
let src = fs.readFileSync(file, "utf8");

if (src.includes('import { fbt } from "fbtee"')) {
  console.log("Already wrapped");
  process.exit(0);
}

function descFor(field, value, slugHint = "") {
  const short = value.length > 48 ? `${value.slice(0, 48)}…` : value;
  if (field === "title") return `Docs page title — ${short}`;
  if (field === "description") return `Docs page description — ${short}`;
  if (field === "text") return `Docs content — ${short}`;
  if (field === "item") return `Docs list item — ${short}`;
  return `Docs — ${slugHint || short}`;
}

function escapeJs(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function wrapField(field, input) {
  return input.replace(
    new RegExp(`(${field}:\\s*)"((?:\\\\.|[^"\\\\])*)"`, "g"),
    (_match, prefix, value) => {
      const unescaped = value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      return `${prefix}fbt("${escapeJs(unescaped)}", "${escapeJs(descFor(field, unescaped))}")`;
    },
  );
}

src = wrapField("title", src);
src = wrapField("description", src);
src = wrapField("text", src);

src = src.replace(/items:\s*\[([\s\S]*?)\]/g, (block, inner) => {
  const wrapped = inner.replace(/"((?:\\.|[^"\\])*)"/g, (_m, value) => {
    const unescaped = value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    return `fbt("${escapeJs(unescaped)}", "${escapeJs(descFor("item", unescaped))}")`;
  });
  return `items: [${wrapped}]`;
});

src = `import { fbt } from "fbtee";\n\n${src}`;
src = src.replace(
  "export const DOCS: Record<string, DocSection> = {",
  "export function getDocs(): Record<string, DocSection> {\n  return {",
);
src = src.replace(/^};(\r?\n\r?\nexport type Example)/m, "  };\n}\n$1");

src = src.replace(
  "export const EXAMPLES: Example[] = [",
  "export function getExamples(): Example[] {\n  return [",
);
src = src.replace(/^];(\s*)$/m, "  ];\n}$1");

src = src.replace(
  /(id: "[^"]+",\s*\n\s*)title: "((?:\\.|[^"\\])*)"/g,
  (_m, prefix, value) => {
    const unescaped = value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    return `${prefix}title: fbt("${escapeJs(unescaped)}", "${escapeJs(descFor("title", unescaped))}")`;
  },
);

src = src.replace(
  /(title: fbt\([^)]+\),\s*\n\s*)description: "((?:\\.|[^"\\])*)"/g,
  (_m, prefix, value) => {
    const unescaped = value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    return `${prefix}description: fbt("${escapeJs(unescaped)}", "${escapeJs(descFor("description", unescaped))}")`;
  },
);

fs.writeFileSync(file, src);
console.log("Wrapped content.ts with fbt()");
