import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Range, TextEdit, WorkspaceEdit } from "vscode-languageserver";
import { LineIndex, parse, type ArviaFile, type Span } from "@arviahq/compiler";
import type { DocumentAnalysis } from "./documents.js";
import { rangeOf } from "./hover.js";
import { listArvFiles, readFileOr } from "./fs-utils.js";
import { crossFileKinds, identityAt, occurrencesInFile } from "./occurrences.js";
import type { WorkspaceState } from "./workspace.js";

export { listArvFiles, readFileOr };

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const TOKEN_NAME_RE = /^[A-Za-z0-9_][A-Za-z0-9_-]*$/;

export function prepareRename(
  analysis: DocumentAnalysis,
  offset: number,
): { range: Range; placeholder: string } | null {
  const resolved = identityAt(analysis, offset);
  if (!resolved) return null;
  return { range: rangeOf(analysis, resolved.span), placeholder: resolved.placeholder };
}

export function getRenameEdits(
  analysis: DocumentAnalysis,
  offset: number,
  newName: string,
  workspace: WorkspaceState,
  contentFor: (file: string) => string | null,
): WorkspaceEdit | null {
  const resolved = identityAt(analysis, offset);
  if (!resolved) return null;
  const { identity } = resolved;

  const validName = identity.kind === "token" ? TOKEN_NAME_RE : NAME_RE;
  if (!validName.test(newName)) return null;

  const changes: Record<string, TextEdit[]> = {};
  const addEdits = (file: string, source: string, ast: ArviaFile) => {
    const index = new LineIndex(source);
    const occurrences = occurrencesInFile(ast, identity);
    if (occurrences.length === 0) return;
    const uri = pathToFileURL(file).toString();
    changes[uri] = occurrences.map(({ span, refPrefix }) => ({
      range: lspRange(index, span),
      newText: refPrefix ? `${refPrefix}${newName}` : newName,
    }));
  };

  // Current document first.
  addEdits(analysis.file, analysis.source, analysis.ast);

  // Shared-theme identities propagate to every file that resolves to it.
  if (crossFileKinds.has(identity.kind) && isSharedThemeMember(analysis, workspace)) {
    const themePath = path.resolve(analysis.file);
    for (const file of listArvFiles(workspace.root)) {
      const resolvedFile = path.resolve(file);
      if (resolvedFile === path.resolve(analysis.file)) continue;
      if (workspace.themePathFor(resolvedFile) !== themePath) continue;
      const source = contentFor(resolvedFile);
      if (source === null) continue;
      addEdits(resolvedFile, source, parse(source, resolvedFile).ast);
    }
  }

  return Object.keys(changes).length > 0 ? { changes } : null;
}

/** True when the current document is a theme other files can resolve to. */
function isSharedThemeMember(analysis: DocumentAnalysis, workspace: WorkspaceState): boolean {
  return workspace.themePathFor(analysis.file) === path.resolve(analysis.file);
}

function lspRange(index: LineIndex, span: Span): Range {
  const range = index.spanToRange(span);
  return {
    start: { line: range.start.line - 1, character: range.start.col - 1 },
    end: { line: range.end.line - 1, character: range.end.col - 1 },
  };
}
