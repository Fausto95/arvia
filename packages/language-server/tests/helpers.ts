import { analyze, LineIndex } from "@arviahq/compiler";
import type { ThemeEnv } from "@arviahq/compiler";
import type { DocumentAnalysis } from "../src/documents.js";

/** Builds a DocumentAnalysis directly (no LSP plumbing). */
export function analysisOf(
  source: string,
  options: { filename?: string; env?: ThemeEnv } = {},
): DocumentAnalysis {
  const file = options.filename ?? "/proj/src/test.arv";
  const result = analyze(source, { filename: file, env: options.env });
  return { ...result, index: new LineIndex(source), file, source };
}

/** Offset of the n-th occurrence of `needle`, pointing inside the word. */
export function at(source: string, needle: string, occurrence = 1): number {
  let index = -1;
  for (let i = 0; i < occurrence; i++) {
    index = source.indexOf(needle, index + 1);
    if (index === -1) throw new Error(`needle not found: ${needle}`);
  }
  return index + 1; // inside the word, not at its very start
}
