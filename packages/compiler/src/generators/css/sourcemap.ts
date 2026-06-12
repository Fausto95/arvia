/** Minimal source map v3 generation (rule-level granularity, single source). */
import type { Span } from "../../diagnostics.js";

export interface CssMapping {
  /** 0-based line in the generated CSS. */
  generatedLine: number;
  /** Source span the rule originates from (its name/anchor). */
  span: Span;
}

export interface CssSourceMap {
  version: 3;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
}

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function vlq(value: number): string {
  let vlqValue = value < 0 ? (-value << 1) | 1 : value << 1;
  let out = "";
  do {
    let digit = vlqValue & 0b11111;
    vlqValue >>>= 5;
    if (vlqValue > 0) digit |= 0b100000;
    out += BASE64[digit]!;
  } while (vlqValue > 0);
  return out;
}

export function buildCssSourceMap(
  mappings: CssMapping[],
  source: { file: string; content: string | null },
): CssSourceMap {
  const byLine = new Map<number, CssMapping>();
  for (const m of mappings) {
    if (!byLine.has(m.generatedLine)) byLine.set(m.generatedLine, m);
  }
  const maxLine = Math.max(0, ...byLine.keys());

  let encoded = "";
  let prevSrcLine = 0;
  let prevSrcCol = 0;
  for (let line = 0; line <= maxLine; line++) {
    if (line > 0) encoded += ";";
    const mapping = byLine.get(line);
    if (!mapping) continue;
    const srcLine = mapping.span.line - 1; // Span lines are 1-based
    const srcCol = mapping.span.col - 1;
    encoded += vlq(0) + vlq(0) + vlq(srcLine - prevSrcLine) + vlq(srcCol - prevSrcCol);
    prevSrcLine = srcLine;
    prevSrcCol = srcCol;
  }

  return {
    version: 3,
    sources: [source.file],
    sourcesContent: [source.content ?? ""],
    names: [],
    mappings: encoded,
  };
}
