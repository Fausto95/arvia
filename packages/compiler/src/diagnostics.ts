export interface Span {
  start: number;
  end: number;
  line: number;
  col: number;
}

export type Severity = "error" | "warning";

export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  file: string;
  line: number;
  col: number;
  span: Span;
  hint?: string;
}

/** Thrown by the lexer/parser on the first unrecoverable error (fail-fast). */
export class ArviaError extends Error {
  constructor(public readonly diagnostic: Diagnostic) {
    super(renderDiagnostic(diagnostic));
    this.name = "ArviaError";
  }
}

export function makeDiagnostic(
  code: string,
  severity: Severity,
  message: string,
  file: string,
  span: Span,
  hint?: string,
): Diagnostic {
  return { code, severity, message, file, line: span.line, col: span.col, span, hint };
}

export function renderDiagnostic(d: Diagnostic): string {
  const hint = d.hint ? `\n  hint: ${d.hint}` : "";
  return `${d.file}:${d.line}:${d.col} ${d.severity} ${d.code}: ${d.message}${hint}`;
}

/** Levenshtein distance, used for did-you-mean hints. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n]!;
}

export function didYouMean(name: string, candidates: Iterable<string>): string | undefined {
  let best: string | undefined;
  let bestDist = 3; // only suggest within distance 2
  for (const c of candidates) {
    const d = levenshtein(name, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}
