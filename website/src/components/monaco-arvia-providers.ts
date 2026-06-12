/**
 * Real language features for the playground editor: the language server's
 * browser-safe core wired into Monaco providers. Direct function calls per
 * request — no worker, no LSP transport.
 */
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import {
  createDocumentAnalysis,
  getCompletions,
  getDocumentColors,
  getColorPresentations,
  getHover,
  themeHostFor,
  type DocumentAnalysis,
} from "@arviahq/language-server/browser";
import themeSource from "../theme.arv?raw";
import { getThemeEnv } from "../playground/theme-env";

const themeHost = themeHostFor(themeSource, "site-theme.arv");

function analysisOf(model: monaco.editor.ITextModel): DocumentAnalysis {
  return createDocumentAnalysis(model.getValue(), {
    filename: "playground.arv",
    env: getThemeEnv(),
  });
}

/** LSP CompletionItemKind → Monaco CompletionItemKind (numbering differs). */
const COMPLETION_KIND: Record<number, monaco.languages.CompletionItemKind> = {
  3: monaco.languages.CompletionItemKind.Function,
  5: monaco.languages.CompletionItemKind.Field,
  6: monaco.languages.CompletionItemKind.Variable,
  7: monaco.languages.CompletionItemKind.Class,
  9: monaco.languages.CompletionItemKind.Module,
  10: monaco.languages.CompletionItemKind.Property,
  12: monaco.languages.CompletionItemKind.Value,
  13: monaco.languages.CompletionItemKind.Enum,
  14: monaco.languages.CompletionItemKind.Keyword,
  16: monaco.languages.CompletionItemKind.Color,
  18: monaco.languages.CompletionItemKind.Reference,
  20: monaco.languages.CompletionItemKind.EnumMember,
  21: monaco.languages.CompletionItemKind.Constant,
  23: monaco.languages.CompletionItemKind.Event,
};

let registered = false;

export function registerArviaProviders(): void {
  if (registered) return;
  registered = true;

  monaco.languages.registerCompletionItemProvider("arvia", {
    triggerCharacters: [":", ".", "@", " "],
    provideCompletionItems(model, position) {
      const analysis = analysisOf(model);
      const offset = model.getOffsetAt(position);
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn,
      );
      return {
        suggestions: getCompletions(analysis, offset).map((item) => ({
          label: item.label,
          kind: COMPLETION_KIND[item.kind ?? 1] ?? monaco.languages.CompletionItemKind.Text,
          detail: item.detail,
          documentation: typeof item.documentation === "string" ? item.documentation : undefined,
          insertText: item.insertText ?? item.label,
          range,
        })),
      };
    },
  });

  monaco.languages.registerHoverProvider("arvia", {
    provideHover(model, position) {
      const analysis = analysisOf(model);
      const hover = getHover(analysis, model.getOffsetAt(position), themeHost);
      if (!hover) return null;
      const value =
        typeof hover.contents === "object" && "value" in hover.contents
          ? hover.contents.value
          : String(hover.contents);
      return {
        contents: [{ value }],
        range: hover.range
          ? new monaco.Range(
              hover.range.start.line + 1,
              hover.range.start.character + 1,
              hover.range.end.line + 1,
              hover.range.end.character + 1,
            )
          : undefined,
      };
    },
  });

  monaco.languages.registerColorProvider("arvia", {
    provideDocumentColors(model) {
      const analysis = analysisOf(model);
      return getDocumentColors(analysis).map((info) => ({
        color: info.color,
        range: new monaco.Range(
          info.range.start.line + 1,
          info.range.start.character + 1,
          info.range.end.line + 1,
          info.range.end.character + 1,
        ),
      }));
    },
    provideColorPresentations(model, colorInfo) {
      const start = model.getOffsetAt({
        lineNumber: colorInfo.range.startLineNumber,
        column: colorInfo.range.startColumn,
      });
      const end = model.getOffsetAt({
        lineNumber: colorInfo.range.endLineNumber,
        column: colorInfo.range.endColumn,
      });
      return getColorPresentations(colorInfo.color, { start, end }).map((p) => ({
        label: p.label,
      }));
    },
  });
}
