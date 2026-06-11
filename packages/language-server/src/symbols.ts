import type { DocumentSymbol } from "vscode-languageserver";
import { SymbolKind } from "vscode-languageserver";
import type { Span } from "@arviahq/compiler";
import type { DocumentAnalysis } from "./documents.js";

export function getDocumentSymbols(analysis: DocumentAnalysis): DocumentSymbol[] {
  const symbol = (
    name: string,
    kind: SymbolKind,
    span: Span,
    nameSpan: Span,
    children?: DocumentSymbol[],
    detail?: string,
  ): DocumentSymbol => {
    const full = analysis.index.spanToRange(span);
    const sel = analysis.index.spanToRange(nameSpan);
    return {
      name,
      kind,
      detail,
      range: {
        start: { line: full.start.line - 1, character: full.start.col - 1 },
        end: { line: full.end.line - 1, character: full.end.col - 1 },
      },
      selectionRange: {
        start: { line: sel.start.line - 1, character: sel.start.col - 1 },
        end: { line: sel.end.line - 1, character: sel.end.col - 1 },
      },
      children,
    };
  };

  const out: DocumentSymbol[] = [];
  for (const item of analysis.ast.items) {
    switch (item.kind) {
      case "theme": {
        const groups = item.groups.map((group) =>
          symbol(
            group.name,
            SymbolKind.Namespace,
            group.span,
            group.nameSpan,
            group.entries.map((entry) =>
              symbol(
                entry.name,
                SymbolKind.Constant,
                entry.span,
                entry.nameSpan,
                undefined,
                entry.value.text,
              ),
            ),
          ),
        );
        out.push(symbol("theme", SymbolKind.Module, item.span, item.span, groups));
        break;
      }
      case "global":
        out.push(symbol("global", SymbolKind.Module, item.span, item.span));
        break;
      case "recipe":
        out.push(
          symbol(item.name, SymbolKind.Function, item.span, item.nameSpan, undefined, "recipe"),
        );
        break;
      case "keyframes":
        out.push(
          symbol(item.name, SymbolKind.Event, item.span, item.nameSpan, undefined, "keyframes"),
        );
        break;
      case "styledecl":
        out.push(
          symbol(item.name, SymbolKind.Constant, item.span, item.nameSpan, undefined, "style"),
        );
        break;
      case "component": {
        const children: DocumentSymbol[] = [];
        for (const part of item.items) {
          if (part.kind === "slots") {
            for (const slot of part.slots) {
              children.push(
                symbol(slot.name, SymbolKind.Field, slot.span, slot.nameSpan, undefined, "slot"),
              );
            }
          }
          if (part.kind === "variants") {
            for (const variant of part.variants) {
              children.push(
                symbol(
                  variant.name,
                  SymbolKind.Enum,
                  variant.span,
                  variant.nameSpan,
                  variant.values.map((value) =>
                    symbol(value.name, SymbolKind.EnumMember, value.span, value.nameSpan),
                  ),
                  "variant",
                ),
              );
            }
          }
          if (part.kind === "tokens") {
            for (const group of part.groups) {
              children.push(
                symbol(
                  group.name,
                  SymbolKind.Namespace,
                  group.span,
                  group.nameSpan,
                  group.entries.map((entry) =>
                    symbol(
                      entry.name,
                      SymbolKind.Constant,
                      entry.span,
                      entry.nameSpan,
                      undefined,
                      entry.value.text,
                    ),
                  ),
                  "local tokens",
                ),
              );
            }
          }
        }
        out.push(
          symbol(item.name, SymbolKind.Class, item.span, item.nameSpan, children, "component"),
        );
        break;
      }
    }
  }
  return out;
}
