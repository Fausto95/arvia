import type { Span } from "./diagnostics.js";

export interface Position {
  /** 1-based, matching Span. */
  line: number;
  /** 1-based column. */
  col: number;
}

export interface SpanRange {
  start: Position;
  end: Position;
}

/**
 * Offset ⇄ position conversion over one source text. Spans carry line/col for
 * their start only; `end` is a bare offset — editor tooling uses this index to
 * recover full ranges.
 */
export class LineIndex {
  /** Offset of the first character of each line (line 1 at index 0). */
  private readonly lineStarts: number[];
  private readonly length: number;

  constructor(text: string) {
    this.length = text.length;
    this.lineStarts = [0];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\n") this.lineStarts.push(i + 1);
    }
  }

  positionAt(offset: number): Position {
    const clamped = Math.max(0, Math.min(offset, this.length));
    // Binary search for the last line start <= offset.
    let lo = 0;
    let hi = this.lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.lineStarts[mid]! <= clamped) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, col: clamped - this.lineStarts[lo]! + 1 };
  }

  offsetAt(position: Position): number {
    const lineIdx = Math.max(0, Math.min(position.line - 1, this.lineStarts.length - 1));
    const lineStart = this.lineStarts[lineIdx]!;
    const lineEnd =
      lineIdx + 1 < this.lineStarts.length ? this.lineStarts[lineIdx + 1]! : this.length;
    return Math.min(lineStart + Math.max(0, position.col - 1), lineEnd);
  }

  spanToRange(span: Span): SpanRange {
    return {
      start: { line: span.line, col: span.col },
      end: this.positionAt(Math.max(span.end, span.start)),
    };
  }
}
