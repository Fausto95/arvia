/**
 * Browser-safe language-service core: the single-document features without
 * the LSP transport or any node API. Embedders (the website playground)
 * call these directly per keystroke — no worker or JSON-RPC needed.
 *
 * Everything exported here must stay free of `node:*` and of runtime
 * imports from `vscode-languageserver` (types-only is fine; enum values
 * come from `vscode-languageserver-types`).
 */
import { analyze, LineIndex, type ThemeEnv } from "@arviahq/compiler";
import type { DocumentAnalysis } from "./documents.js";

export type { DocumentAnalysis };
export { getCompletions } from "./completion.js";
export { getHover } from "./hover.js";
export { getDocumentColors, getColorPresentations, parseColor } from "./colors.js";
export { getInlayHints } from "./inlay-hints.js";
export { getDocumentSymbols } from "./symbols.js";
export { toLspDiagnostics } from "./diagnostics.js";
export { lintDiagnostics } from "./lints.js";
export { getCodeActions } from "./code-actions.js";
export { getFoldingRanges } from "./folding.js";
export { getSelectionRanges } from "./selection-ranges.js";
export { getSemanticTokens, semanticTokensLegend } from "./semantic-tokens.js";
export { getFormattingEdits } from "./formatting.js";
export { nullThemeHost, themeHostFor, type ThemeHost, type ThemeInfo } from "./theme-host.js";

/** Builds the analysis object every feature function consumes. */
export function createDocumentAnalysis(
  source: string,
  options: { filename?: string; env?: ThemeEnv; sharedEnvFile?: boolean } = {},
): DocumentAnalysis {
  const file = options.filename ?? "playground.arv";
  const result = analyze(source, {
    filename: file,
    env: options.env,
    sharedEnvFile: options.sharedEnvFile,
  });
  return { ...result, index: new LineIndex(source), file, source };
}
