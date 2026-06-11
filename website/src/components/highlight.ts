import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import js from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import ts from "shiki/langs/typescript.mjs";
import tsx from "shiki/langs/tsx.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";

let highlighter: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighter) {
    highlighter = createHighlighterCore({
      themes: [githubDark, githubLight],
      langs: [ts, tsx, js, css, json, bash],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighter;
}

export function langFromLabel(label?: string, code?: string): string {
  if (!label) {
    if (code && /^\s*(theme|component|recipe|global|keyframes|style)\b/m.test(code)) {
      return "arv";
    }
    return "typescript";
  }
  const lower = label.toLowerCase();
  if (lower === "terminal" || lower === "shell") return "bash";
  if (lower === "js" || lower === "javascript") return "javascript";
  if (lower === "css") return "css";
  if (lower === ".d.ts" || lower === "types" || lower.endsWith(".d.ts")) return "typescript";
  if (lower.endsWith(".tsx")) return "tsx";
  if (lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".arv") || lower.includes(".arv")) return "arv";
  if (lower.endsWith(".css")) return "css";
  return "typescript";
}

const ARV_COLORS = {
  light: {
    keyword: "#cf222e",
    token: "#953800",
    property: "#116329",
    hex: "#0550ae",
    string: "#0a3069",
    comment: "#6e7781",
    text: "#24292e",
    bg: "#f6f8fa",
  },
  dark: {
    keyword: "#ff7b72",
    token: "#ffa657",
    property: "#7ee787",
    hex: "#79c0ff",
    string: "#a5d6ff",
    comment: "#8b949e",
    text: "#e6edf3",
    bg: "#0d1117",
  },
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlightArv(code: string, theme: "light" | "dark"): string {
  const c = ARV_COLORS[theme];
  const patterns: { re: RegExp; color: string }[] = [
    { re: /\/\/.*$/gm, color: c.comment },
    {
      re: /\b(component|recipe|theme|global|keyframes|style|base|slots|variants|defaults|compound|responsive|container|tokens|modes|use|doc)\b|@dark\b|&:(?:hover|focus-visible|active|disabled|focus)\b/g,
      color: c.keyword,
    },
    {
      re: /\b(?:color|space|radius|font|duration|easing|breakpoint|keyframes)\.[a-zA-Z0-9]+\b/g,
      color: c.token,
    },
    { re: /#[0-9a-fA-F]{3,8}\b/g, color: c.hex },
    { re: /"(?:[^"\\]|\\.)*"/g, color: c.string },
    {
      re: /\b[a-zA-Z-]+(?=\s*:)/g,
      color: c.property,
    },
  ];

  type Span = { start: number; end: number; color: string };
  const spans: Span[] = [];
  for (const { re, color } of patterns) {
    for (const match of code.matchAll(re)) {
      if (match.index === undefined) continue;
      spans.push({ start: match.index, end: match.index + match[0].length, color });
    }
  }
  spans.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: Span[] = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span.start < last.end) continue;
    merged.push(span);
  }

  let html = "";
  let pos = 0;
  for (const span of merged) {
    html += escapeHtml(code.slice(pos, span.start));
    html += `<span style="color:${span.color}">${escapeHtml(code.slice(span.start, span.end))}</span>`;
    pos = span.end;
  }
  html += escapeHtml(code.slice(pos));

  return `<pre class="shiki" style="background:${c.bg};color:${c.text}"><code>${html}</code></pre>`;
}

export async function highlightCode(
  code: string,
  lang: string,
  theme: "light" | "dark",
): Promise<string> {
  if (lang === "arv") {
    return highlightArv(code.trimEnd(), theme);
  }

  const h = await getHighlighter();
  const loaded = h.getLoadedLanguages().includes(lang as never) ? lang : "typescript";
  return h.codeToHtml(code.trimEnd(), {
    lang: loaded,
    theme: theme === "dark" ? "github-dark" : "github-light",
  });
}
