import type { Diagnostic as LspDiagnostic } from "vscode-languageserver";
import type { DocumentAnalysis } from "./documents.js";

/** Maps compiler diagnostics to LSP diagnostics with full (start+end) ranges. */
export function toLspDiagnostics(analysis: DocumentAnalysis): LspDiagnostic[] {
  return analysis.diagnostics.map((d) => {
    const range = analysis.index.spanToRange(d.span);
    return {
      severity: d.severity === "error" ? 1 : 2,
      range: {
        start: { line: range.start.line - 1, character: range.start.col - 1 },
        end: { line: range.end.line - 1, character: range.end.col - 1 },
      },
      message: d.hint ? `${d.message} (${d.hint})` : d.message,
      source: "arvia",
      code: d.code,
    };
  });
}
