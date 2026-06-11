import type { InlayHint, Range } from "vscode-languageserver";
import { InlayHintKind } from "vscode-languageserver";
import type { ComponentDecl } from "@arviahq/compiler";
import type { DocumentAnalysis } from "./documents.js";
import { findLocalToken } from "./hover.js";
import { walkDeclarations } from "./walk.js";

const MAX_HINT_LENGTH = 28;

/** `padding: space.4` → ghost text ` = 16px` after the ref. */
export function getInlayHints(analysis: DocumentAnalysis, range: Range): InlayHint[] {
  const startOffset = analysis.index.offsetAt({
    line: range.start.line + 1,
    col: range.start.character + 1,
  });
  const endOffset = analysis.index.offsetAt({
    line: range.end.line + 1,
    col: range.end.character + 1,
  });

  const hints: InlayHint[] = [];
  for (const { decl, component } of walkDeclarations(analysis.ast)) {
    for (const word of decl.value.words) {
      if (word.kind !== "ref" || word.group === "keyframes") continue;
      if (word.span.end < startOffset || word.span.start > endOffset) continue;
      const resolved = resolveForHint(analysis, word.group, word.name, component);
      if (!resolved || resolved === word.text) continue;
      const position = analysis.index.positionAt(word.span.end);
      hints.push({
        position: { line: position.line - 1, character: position.col - 1 },
        label: ` = ${truncate(resolved)}`,
        kind: InlayHintKind.Type,
        paddingLeft: false,
      });
    }
  }
  return hints;
}

function resolveForHint(
  analysis: DocumentAnalysis,
  group: string,
  name: string,
  component: ComponentDecl | null,
): string | null {
  if (component) {
    const local = findLocalToken(component, group, name);
    if (local) return local.value;
  }
  const entry = analysis.env.tokens[group]?.[name];
  if (entry === undefined) return null;
  if (typeof entry === "string") return entry;
  const modes = analysis.env.modes;
  const first = modes?.[0];
  return (first && entry[first]) ?? Object.values(entry)[0] ?? null;
}

function truncate(value: string): string {
  return value.length > MAX_HINT_LENGTH ? `${value.slice(0, MAX_HINT_LENGTH - 1)}…` : value;
}
