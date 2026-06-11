import { ArviaError, makeDiagnostic, type Span } from "../diagnostics.js";
import type { Token, TokenKind } from "./tokens.js";

export interface LexerState {
  pos: number;
  line: number;
  col: number;
}

const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
const isIdentPart = (c: string) => /[A-Za-z0-9_-]/.test(c);
const isDigit = (c: string) => c >= "0" && c <= "9";

/**
 * Pull lexer with parser-driven modes. The parser decides, from grammar
 * context, whether to pull a normal token (`next`), a raw declaration value
 * (`rawValue`, runs to an unnested `;` or `}`) or a raw selector
 * (`rawSelector`, runs to `{`).
 */
export class Lexer {
  private pos = 0;
  private line = 1;
  private col = 1;

  constructor(
    private readonly src: string,
    readonly file: string,
  ) {}

  mark(): LexerState {
    return { pos: this.pos, line: this.line, col: this.col };
  }

  reset(state: LexerState): void {
    this.pos = state.pos;
    this.line = state.line;
    this.col = state.col;
  }

  private here(): Span {
    return { start: this.pos, end: this.pos, line: this.line, col: this.col };
  }

  private fail(code: string, message: string, span: Span, hint?: string): never {
    throw new ArviaError(makeDiagnostic(code, "error", message, this.file, span, hint));
  }

  private bump(): string {
    const c = this.src[this.pos]!;
    this.pos++;
    if (c === "\n") {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return c;
  }

  private skipTrivia(): void {
    for (;;) {
      const c = this.src[this.pos];
      if (c === undefined) return;
      if (c === " " || c === "\t" || c === "\r" || c === "\n") {
        this.bump();
        continue;
      }
      if (c === "/" && this.src[this.pos + 1] === "/") {
        while (this.pos < this.src.length && this.src[this.pos] !== "\n") this.bump();
        continue;
      }
      if (c === "/" && this.src[this.pos + 1] === "*") {
        const start = this.here();
        this.bump();
        this.bump();
        while (
          this.pos < this.src.length &&
          !(this.src[this.pos] === "*" && this.src[this.pos + 1] === "/")
        ) {
          this.bump();
        }
        if (this.pos >= this.src.length) {
          this.fail("ARV002", "unterminated block comment", start);
        }
        this.bump();
        this.bump();
        continue;
      }
      return;
    }
  }

  /** Skips trivia, then returns the next significant character (or null at EOF) without consuming it. */
  peekChar(): string | null {
    this.skipTrivia();
    return this.src[this.pos] ?? null;
  }

  /** Skips trivia and consumes one character. Never throws — used by the
   *  parser's panic-mode recovery to make progress past malformed input. */
  skipChar(): void {
    try {
      this.skipTrivia();
    } catch {
      // Unterminated block comment: swallow it and run to EOF below.
    }
    if (this.pos < this.src.length) this.bump();
    else this.pos = this.src.length;
  }

  next(): Token {
    this.skipTrivia();
    const span = this.here();
    const c = this.src[this.pos];
    if (c === undefined) {
      return { kind: "eof", text: "", span };
    }
    const punct: Record<string, TokenKind> = {
      "{": "lbrace",
      "}": "rbrace",
      ";": "semicolon",
      ":": "colon",
      "=": "equals",
      "&": "amp",
      "@": "at",
      "|": "pipe",
    };
    if (punct[c]) {
      this.bump();
      span.end = this.pos;
      return { kind: punct[c], text: c, span };
    }
    // `-` may start an ident for vendor prefixes (-webkit-…) and custom properties (--x).
    const dashIdent = c === "-" && /[A-Za-z_-]/.test(this.src[this.pos + 1] ?? "");
    if (isIdentStart(c) || isDigit(c) || dashIdent) {
      const kind: TokenKind = isDigit(c) ? "number" : "ident";
      let text = "";
      while (this.pos < this.src.length && isIdentPart(this.src[this.pos]!)) {
        text += this.bump();
      }
      span.end = this.pos;
      return { kind, text, span };
    }
    this.fail("ARV001", `unexpected character ${JSON.stringify(c)}`, span);
  }

  /**
   * Lexes a raw declaration value: everything up to (but not including) the
   * first `;` or `}` outside parentheses and strings. Comments inside values
   * pass through verbatim (`/* *\/` is valid CSS; `//` appears in urls).
   *
   * When `stopBeforeDoc` is set, also stops before an optional `doc "..."`
   * suffix used on theme token entries.
   */
  rawValue(options?: { stopBeforeDoc?: boolean }): Token {
    this.skipTrivia();
    const span = this.here();
    const start = this.pos;
    let depth = 0;
    let quote: string | null = null;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos]!;
      if (quote) {
        if (c === "\\") {
          this.bump();
          if (this.pos < this.src.length) this.bump();
          continue;
        }
        if (c === quote) quote = null;
        this.bump();
        continue;
      }
      if (c === '"' || c === "'") {
        quote = c;
        this.bump();
        continue;
      }
      if (c === "(") depth++;
      if (c === ")" && depth > 0) depth--;
      if (options?.stopBeforeDoc && depth === 0 && this.atDocSuffix()) break;
      if (depth === 0 && (c === ";" || c === "}")) break;
      this.bump();
    }
    if (quote) {
      this.fail("ARV003", "unterminated string in value", span);
    }
    const text = this.src.slice(start, this.pos).trim();
    if (text.length === 0) {
      this.fail("ARV003", "expected a value", span);
    }
    span.end = start + this.src.slice(start, this.pos).trimEnd().length;
    return { kind: "raw", text, span };
  }

  /** `doc "..."` or `doc '...'` immediately ahead (theme token metadata). */
  private atDocSuffix(): boolean {
    const rest = this.src.slice(this.pos);
    return /^\s+doc\s+["']/.test(rest);
  }

  /**
   * Lexes a raw selector (or state-selector suffix): everything up to `{`.
   * Whitespace runs are collapsed to single spaces.
   */
  rawSelector(): Token {
    this.skipTrivia();
    const span = this.here();
    const start = this.pos;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos]!;
      if (c === "{") break;
      if (c === "}" || c === ";") {
        this.fail("ARV004", `expected '{' after selector, found ${JSON.stringify(c)}`, this.here());
      }
      this.bump();
    }
    if (this.pos >= this.src.length) {
      this.fail("ARV004", "unexpected end of file while reading selector", span);
    }
    const text = this.src.slice(start, this.pos).trim().replace(/\s+/g, " ");
    if (text.length === 0) {
      this.fail("ARV004", "expected a selector before '{'", span);
    }
    span.end = start + this.src.slice(start, this.pos).trimEnd().length;
    return { kind: "raw", text, span };
  }
}
