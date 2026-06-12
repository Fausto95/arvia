import type { Diagnostic as LspDiagnostic } from "vscode-languageserver";
import type { DiagnosticFix, LineIndex, Span } from "@arviahq/compiler";
import type { DocumentAnalysis } from "./documents.js";
import { occurrencesInFile } from "./occurrences.js";

/** Quick-fix payload carried on a diagnostic's `data` (LSP round-trips it). */
export interface FixData {
  fix: DiagnosticFix;
  /** Lint fixes are suggestions, not corrections — never auto-applied. */
  preferred?: boolean;
}

/**
 * Editor-only hints (not compiler diagnostics): discoverability anchors for
 * the quick fixes in code-actions.ts. Suppressed while the file has errors —
 * a half-typed component should not sprout advice.
 */
export function lintDiagnostics(analysis: DocumentAnalysis): LspDiagnostic[] {
  if (analysis.diagnostics.some((d) => d.severity === "error")) return [];

  const lints: LspDiagnostic[] = [];
  for (const item of analysis.ast.items) {
    if (item.kind !== "component") continue;

    const variantsBlock = item.items.find((i) => i.kind === "variants");
    const hasDefaults = item.items.some((i) => i.kind === "defaults");
    if (variantsBlock && !hasDefaults) {
      const entries = variantsBlock.variants
        .filter((v) => v.values.length > 0)
        .map((v) => `${v.name}: ${v.values[0]!.name};`);
      if (entries.length > 0) {
        const indent = lineIndentAt(analysis.source, variantsBlock.span.start);
        const insertAt = variantsBlock.span.end;
        lints.push({
          severity: 4, // Hint
          range: lspRange(analysis.index, item.nameSpan),
          message: `component '${item.name}' has variants but no defaults — all variant props are required`,
          source: "arvia",
          code: "missing-defaults",
          data: {
            preferred: false,
            fix: {
              title: "Insert defaults block",
              edits: [
                {
                  span: emptySpanAt(analysis.index, insertAt),
                  newText: `\n\n${indent}defaults { ${entries.join(" ")} }`,
                },
              ],
            },
          } satisfies FixData,
        });
      }
    }

    // Unused slots stay editor-only (Hint + Unnecessary): an unstyled slot
    // consumed as a TSX className hook is legitimate, so this must never
    // surface in builds — the compiler deliberately has no such warning.
    for (const block of item.items) {
      if (block.kind !== "slots") continue;
      for (const slot of block.slots) {
        if (slot.name === "root" || slot.items.length > 0) continue;
        const occurrences = occurrencesInFile(analysis.ast, {
          kind: "slot",
          component: item,
          name: slot.name,
        });
        if (occurrences.some((o) => o.role === "reference")) continue;
        const removeSpan =
          block.slots.length === 1
            ? block.span // last slot: drop the whole `slots { }` block
            : spanAt(
                analysis.index,
                slot.span.start,
                skipTrailingWs(analysis.source, slot.span.end),
              );
        lints.push({
          severity: 4, // Hint
          range: lspRange(analysis.index, slot.nameSpan),
          message: `slot '${slot.name}' has no styles and is never referenced in this file`,
          source: "arvia",
          code: "unused-slot",
          tags: [1], // Unnecessary
          data: {
            preferred: false,
            fix: {
              title: `Remove slot '${slot.name}' (may be used from TSX)`,
              edits: [{ span: removeSpan, newText: "" }],
            },
          } satisfies FixData,
        });
      }
    }
  }
  return lints;
}

/** Whitespace prefix of the line containing `offset`. */
function lineIndentAt(source: string, offset: number): string {
  let lineStart = source.lastIndexOf("\n", offset - 1) + 1;
  let end = lineStart;
  while (end < source.length && (source[end] === " " || source[end] === "\t")) end++;
  return source.slice(lineStart, end);
}

function skipTrailingWs(source: string, offset: number): number {
  let end = offset;
  while (end < source.length && /\s/.test(source[end]!)) {
    end++;
    if (source[end - 1] === "\n") break; // eat at most one line break
  }
  return end;
}

/** Builds a Span whose start line/col agree with its offsets. */
function spanAt(index: LineIndex, start: number, end: number): Span {
  const pos = index.positionAt(start);
  return { start, end, line: pos.line, col: pos.col };
}

function emptySpanAt(index: LineIndex, offset: number): Span {
  return spanAt(index, offset, offset);
}

export function lspRange(
  index: LineIndex,
  span: Span,
): { start: { line: number; character: number }; end: { line: number; character: number } } {
  const range = index.spanToRange(span);
  return {
    start: { line: range.start.line - 1, character: range.start.col - 1 },
    end: { line: range.end.line - 1, character: range.end.col - 1 },
  };
}
