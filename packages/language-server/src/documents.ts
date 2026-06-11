import { analyze, LineIndex, type AnalyzeResult } from "@arviahq/compiler";
import type { TextDocument } from "vscode-languageserver-textdocument";
import type { WorkspaceState } from "./workspace.js";

export interface DocumentAnalysis extends AnalyzeResult {
  index: LineIndex;
  file: string;
  source: string;
}

export function fileForUri(uri: string): string {
  return uri.startsWith("file://") ? decodeURIComponent(uri.slice(7)) : uri;
}

/** Per-document analysis cache keyed by document version. */
export class DocumentStore {
  private cache = new Map<string, { version: number; analysis: DocumentAnalysis }>();

  constructor(private readonly workspaceFor: (uri: string) => WorkspaceState) {}

  analysisFor(doc: TextDocument): DocumentAnalysis {
    const cached = this.cache.get(doc.uri);
    if (cached && cached.version === doc.version) return cached.analysis;
    const file = fileForUri(doc.uri);
    const source = doc.getText();
    const env = this.workspaceFor(doc.uri).envFor(file);
    const result = analyze(source, { filename: file, env });
    const analysis: DocumentAnalysis = {
      ...result,
      index: new LineIndex(source),
      file,
      source,
    };
    this.cache.set(doc.uri, { version: doc.version, analysis });
    return analysis;
  }

  invalidate(uri: string): void {
    this.cache.delete(uri);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}
