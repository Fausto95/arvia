import { pathToFileURL } from "node:url";
import type { SymbolKind, WorkspaceSymbol } from "vscode-languageserver";
import { LineIndex, parse, type ArviaFile, type Span } from "@arviahq/compiler";
import { listArvFiles } from "./fs-utils.js";
import type { WorkspaceState } from "./workspace.js";

const MAX_SYMBOLS = 2000;

// SymbolKind values (numeric to keep this module type-only over
// vscode-languageserver, like the rest of the package).
const KIND_CLASS = 5 as SymbolKind;
const KIND_FUNCTION = 12 as SymbolKind;
const KIND_CONSTANT = 14 as SymbolKind;
const KIND_EVENT = 24 as SymbolKind;

/** Components, styles, recipes, keyframes and theme tokens across every
 *  .arv file in each open workspace, fuzzy-filtered by `query`. */
export function getWorkspaceSymbols(
  query: string,
  workspaces: Iterable<WorkspaceState>,
  contentFor: (file: string) => string | null,
): WorkspaceSymbol[] {
  const symbols: WorkspaceSymbol[] = [];
  const seenFiles = new Set<string>();
  const matches = fuzzyMatcher(query);

  for (const workspace of workspaces) {
    for (const file of listArvFiles(workspace.root)) {
      if (seenFiles.has(file)) continue;
      seenFiles.add(file);
      const source = contentFor(file);
      if (source === null) continue;
      const index = new LineIndex(source);
      const push = (name: string, kind: SymbolKind, span: Span, container?: string) => {
        if (symbols.length >= MAX_SYMBOLS || !matches(name)) return;
        const range = index.spanToRange(span);
        symbols.push({
          name,
          kind,
          containerName: container,
          location: {
            uri: pathToFileURL(file).toString(),
            range: {
              start: { line: range.start.line - 1, character: range.start.col - 1 },
              end: { line: range.end.line - 1, character: range.end.col - 1 },
            },
          },
        });
      };
      collect(parse(source, file).ast, push);
      if (symbols.length >= MAX_SYMBOLS) return symbols;
    }
  }
  return symbols;
}

function collect(
  ast: ArviaFile,
  push: (name: string, kind: SymbolKind, span: Span, container?: string) => void,
): void {
  for (const item of ast.items) {
    switch (item.kind) {
      case "component":
        push(item.name, KIND_CLASS, item.nameSpan);
        break;
      case "styledecl":
        push(item.name, KIND_CONSTANT, item.nameSpan);
        break;
      case "recipe":
        push(item.name, KIND_FUNCTION, item.nameSpan);
        break;
      case "keyframes":
        push(item.name, KIND_EVENT, item.nameSpan);
        break;
      case "theme":
        for (const group of item.groups) {
          for (const entry of group.entries) {
            push(`${group.name}.${entry.name}`, KIND_CONSTANT, entry.nameSpan, "theme");
          }
        }
        break;
    }
  }
}

/** Case-insensitive subsequence match; empty query matches everything. */
function fuzzyMatcher(query: string): (name: string) => boolean {
  const q = query.toLowerCase();
  if (q.length === 0) return () => true;
  return (name) => {
    const n = name.toLowerCase();
    let qi = 0;
    for (let i = 0; i < n.length && qi < q.length; i++) {
      if (n[i] === q[qi]) qi++;
    }
    return qi === q.length;
  };
}
