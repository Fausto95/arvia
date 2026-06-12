import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Location } from "vscode-languageserver";
import { LineIndex, parse, type ArviaFile, type Span } from "@arviahq/compiler";
import { nodeAtOffset } from "./ast-query.js";
import type { DocumentAnalysis } from "./documents.js";
import { listArvFiles } from "./fs-utils.js";
import {
  crossFileKinds,
  identityAt,
  occurrencesInFile,
  type SymbolIdentity,
} from "./occurrences.js";
import type { WorkspaceState } from "./workspace.js";

/**
 * Find-references for .arv symbols. References from TS/TSX call sites are
 * tsserver's job (the typescript-plugin maps component names through the
 * virtual .d.ts); component/style names here return only their declaration.
 */
export function getReferences(
  analysis: DocumentAnalysis,
  offset: number,
  includeDeclaration: boolean,
  workspace: WorkspaceState,
  contentFor: (file: string) => string | null,
): Location[] | null {
  const resolved = identityAt(analysis, offset);
  if (!resolved) {
    // Components/styles are TS exports — surface the declaration so the
    // request isn't a dead end; .tsx usages come from tsserver.
    const target = nodeAtOffset(analysis.ast, offset);
    if (target?.kind === "component-name") {
      return [locationFor(analysis.file, analysis.index, target.component.nameSpan)];
    }
    if (target?.kind === "style-name") {
      return [locationFor(analysis.file, analysis.index, target.style.nameSpan)];
    }
    return null;
  }
  const { identity } = resolved;

  const locations: Location[] = [];
  const collect = (file: string, index: LineIndex, ast: ArviaFile) => {
    for (const occurrence of occurrencesInFile(ast, identity)) {
      if (!includeDeclaration && occurrence.role === "declaration") continue;
      locations.push(locationFor(file, index, occurrence.span));
    }
  };

  collect(analysis.file, analysis.index, analysis.ast);

  const anchor = themeAnchorFor(identity, analysis, workspace);
  if (anchor) {
    for (const file of listArvFiles(workspace.root)) {
      const resolvedFile = path.resolve(file);
      if (resolvedFile === path.resolve(analysis.file)) continue;
      if (resolvedFile !== anchor && workspace.themePathFor(resolvedFile) !== anchor) continue;
      const source = contentFor(resolvedFile);
      if (source === null) continue;
      collect(resolvedFile, new LineIndex(source), parse(source, resolvedFile).ast);
    }
  }

  return locations.length > 0 ? locations : null;
}

/**
 * Theme path to fan out from, or null when the symbol is file-local.
 * Unlike rename (which only fans out when invoked *in* the theme file),
 * references invoked from a component file on a shared-theme symbol anchor
 * at the theme and search all of its sibling files.
 */
function themeAnchorFor(
  identity: SymbolIdentity,
  analysis: DocumentAnalysis,
  workspace: WorkspaceState,
): string | null {
  if (!crossFileKinds.has(identity.kind)) return null;
  if (identity.kind === "token" && identity.component) return null; // component-local
  const themePath = workspace.themePathFor(analysis.file);
  if (!themePath) return null;
  if (themePath === path.resolve(analysis.file)) return themePath;
  // Symbols declared in the current (non-theme) file stay file-local unless
  // the shared theme also declares them; anchor only when the theme does.
  const theme = workspace.themeFor(analysis.file);
  if (!theme) return null;
  const declaredInTheme = occurrencesInFile(theme.ast, identity).some(
    (o) => o.role === "declaration",
  );
  return declaredInTheme ? themePath : null;
}

function locationFor(file: string, index: LineIndex, span: Span): Location {
  const range = index.spanToRange(span);
  return {
    uri: pathToFileURL(file).toString(),
    range: {
      start: { line: range.start.line - 1, character: range.start.col - 1 },
      end: { line: range.end.line - 1, character: range.end.col - 1 },
    },
  };
}
