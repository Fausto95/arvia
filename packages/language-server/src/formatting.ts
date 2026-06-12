import type { FormattingOptions, TextEdit } from "vscode-languageserver";
import { formatArv } from "@arviahq/compiler";
import type { DocumentAnalysis } from "./documents.js";

/** Full-document formatting; empty result when already canonical. */
export function getFormattingEdits(
  analysis: DocumentAnalysis,
  options: FormattingOptions,
): TextEdit[] {
  const indent = options.insertSpaces === false ? "\t" : " ".repeat(options.tabSize || 2);
  const formatted = formatArv(analysis.source, { indent });
  if (formatted === analysis.source) return [];
  const end = analysis.index.positionAt(analysis.source.length);
  return [
    {
      range: {
        start: { line: 0, character: 0 },
        end: { line: end.line - 1, character: end.col - 1 },
      },
      newText: formatted,
    },
  ];
}
