#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import {
  createConnection,
  TextDocumentSyncKind,
  TextDocuments,
} from "vscode-languageserver/node.js";
import type { InitializeParams, InitializeResult } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getCodeActions } from "./code-actions.js";
import { getColorPresentations, getDocumentColors } from "./colors.js";
import { getCompletions } from "./completion.js";
import { getDefinition } from "./definition.js";
import { toLspDiagnostics } from "./diagnostics.js";
import { lintDiagnostics } from "./lints.js";
import { DocumentStore, fileForUri } from "./documents.js";
import { getFoldingRanges } from "./folding.js";
import { getFormattingEdits } from "./formatting.js";
import { getHover } from "./hover.js";
import { getSelectionRanges } from "./selection-ranges.js";
import { getSemanticTokens, semanticTokensLegend } from "./semantic-tokens.js";
import { getWorkspaceSymbols } from "./workspace-symbols.js";
import { getInlayHints } from "./inlay-hints.js";
import { getReferences } from "./references.js";
import { getRenameEdits, prepareRename, readFileOr } from "./rename.js";
import { getDocumentSymbols } from "./symbols.js";
import { WorkspaceState, workspaceRootFor } from "./workspace.js";

const DIAGNOSTICS_DEBOUNCE_MS = 200;

const connection = createConnection();
const documents = new TextDocuments(TextDocument);
const workspaces = new Map<string, WorkspaceState>();

function pathToFileUri(file: string): string {
  return pathToFileURL(file).toString();
}

function workspaceFor(uri: string): WorkspaceState {
  const root = workspaceRootFor(fileForUri(uri));
  let ws = workspaces.get(root);
  if (!ws) {
    ws = new WorkspaceState(root);
    workspaces.set(root, ws);
  }
  return ws;
}

const store = new DocumentStore(workspaceFor);
const diagnosticTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Open-document content when available, disk content otherwise. */
function contentFor(file: string): string | null {
  const open = documents.get(pathToFileUri(file));
  return open ? open.getText() : readFileOr(file);
}

function publishDiagnostics(doc: TextDocument): void {
  const analysis = store.analysisFor(doc);
  connection.sendDiagnostics({
    uri: doc.uri,
    diagnostics: [...toLspDiagnostics(analysis), ...lintDiagnostics(analysis)],
  });
}

function scheduleDiagnostics(doc: TextDocument, immediate = false): void {
  const pending = diagnosticTimers.get(doc.uri);
  if (pending) clearTimeout(pending);
  if (immediate) {
    publishDiagnostics(doc);
    return;
  }
  diagnosticTimers.set(
    doc.uri,
    setTimeout(() => {
      diagnosticTimers.delete(doc.uri);
      const current = documents.get(doc.uri);
      if (current) publishDiagnostics(current);
    }, DIAGNOSTICS_DEBOUNCE_MS),
  );
}

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: [":", ".", "@", " "] },
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      documentSymbolProvider: true,
      colorProvider: true,
      inlayHintProvider: true,
      renameProvider: { prepareProvider: true },
      codeActionProvider: { codeActionKinds: ["quickfix"] },
      foldingRangeProvider: true,
      selectionRangeProvider: true,
      workspaceSymbolProvider: true,
      documentFormattingProvider: true,
      semanticTokensProvider: {
        legend: semanticTokensLegend,
        full: true,
        range: true,
      },
    },
  };
});

documents.onDidOpen((event) => {
  scheduleDiagnostics(event.document, true);
});

documents.onDidChangeContent((event) => {
  scheduleDiagnostics(event.document);
});

documents.onDidSave((event) => {
  scheduleDiagnostics(event.document, true);
});

documents.onDidClose((event) => {
  const pending = diagnosticTimers.get(event.document.uri);
  if (pending) clearTimeout(pending);
  diagnosticTimers.delete(event.document.uri);
  store.invalidate(event.document.uri);
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

// A changed .arv anywhere may be a theme another document depends on:
// invalidate and re-validate everything open.
connection.onDidChangeWatchedFiles((params) => {
  for (const change of params.changes) {
    const file = fileForUri(change.uri);
    for (const ws of workspaces.values()) ws.invalidate(file);
  }
  store.invalidateAll();
  for (const doc of documents.all()) scheduleDiagnostics(doc);
});

connection.onCompletion((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getCompletions(store.analysisFor(doc), doc.offsetAt(params.position));
});

connection.onHover((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  const ws = workspaceFor(params.textDocument.uri);
  return getHover(store.analysisFor(doc), doc.offsetAt(params.position), ws);
});

connection.onDefinition((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  const ws = workspaceFor(params.textDocument.uri);
  return getDefinition(store.analysisFor(doc), doc.offsetAt(params.position), ws);
});

connection.onReferences((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  return getReferences(
    store.analysisFor(doc),
    doc.offsetAt(params.position),
    params.context.includeDeclaration,
    workspaceFor(params.textDocument.uri),
    contentFor,
  );
});

connection.onDocumentSymbol((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getDocumentSymbols(store.analysisFor(doc));
});

connection.onDocumentColor((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getDocumentColors(store.analysisFor(doc));
});

connection.onColorPresentation((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getColorPresentations(params.color, {
    start: doc.offsetAt(params.range.start),
    end: doc.offsetAt(params.range.end),
  });
});

connection.languages.inlayHint.on((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getInlayHints(store.analysisFor(doc), params.range);
});

connection.onFoldingRanges((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getFoldingRanges(store.analysisFor(doc));
});

connection.onSelectionRanges((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getSelectionRanges(store.analysisFor(doc), params.positions);
});

connection.onWorkspaceSymbol((params) => {
  return getWorkspaceSymbols(params.query, workspaces.values(), contentFor);
});

connection.onDocumentFormatting((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getFormattingEdits(store.analysisFor(doc), params.options);
});

connection.languages.semanticTokens.on((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return { data: [] };
  return getSemanticTokens(store.analysisFor(doc));
});

connection.languages.semanticTokens.onRange((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return { data: [] };
  return getSemanticTokens(store.analysisFor(doc), {
    start: doc.offsetAt(params.range.start),
    end: doc.offsetAt(params.range.end),
  });
});

connection.onCodeAction((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  return getCodeActions(store.analysisFor(doc), params.context, params.textDocument.uri);
});

connection.onPrepareRename((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  return prepareRename(store.analysisFor(doc), doc.offsetAt(params.position));
});

connection.onRenameRequest((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  const ws = workspaceFor(params.textDocument.uri);
  return getRenameEdits(
    store.analysisFor(doc),
    doc.offsetAt(params.position),
    params.newName,
    ws,
    contentFor,
  );
});

documents.listen(connection);
connection.listen();
