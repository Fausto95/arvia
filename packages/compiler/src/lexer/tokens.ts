import type { Span } from "../diagnostics.js";

export type TokenKind =
  | "ident" // letter/_ start, may contain digits, _ and -
  | "number" // digit start, may contain letters (e.g. theme names: 4, 2xl)
  | "lbrace"
  | "rbrace"
  | "semicolon"
  | "colon"
  | "equals"
  | "amp"
  | "at"
  | "pipe"
  | "raw" // raw value / raw selector text
  | "eof";

export interface Token {
  kind: TokenKind;
  text: string;
  span: Span;
}
