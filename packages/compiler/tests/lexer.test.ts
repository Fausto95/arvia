import { describe, expect, it } from "vitest";
import { Lexer } from "../src/lexer/lexer.js";
import { ArviaError } from "../src/diagnostics.js";

const kinds = (src: string) => {
  const lx = new Lexer(src, "test.arv");
  const out: string[] = [];
  for (;;) {
    const tok = lx.next();
    if (tok.kind === "eof") break;
    out.push(`${tok.kind}:${tok.text}`);
  }
  return out;
};

describe("lexer", () => {
  it("tokenizes idents, numbers and punctuation", () => {
    expect(kinds("component Button { base : ; = & }")).toEqual([
      "ident:component",
      "ident:Button",
      "lbrace:{",
      "ident:base",
      "colon::",
      "semicolon:;",
      "equals:=",
      "amp:&",
      "rbrace:}",
    ]);
  });

  it("lexes hyphenated idents as one token and digit-led names as numbers", () => {
    expect(kinds("border-radius 4 2xl")).toEqual(["ident:border-radius", "number:4", "number:2xl"]);
  });

  it("lexes dash-led property names (vendor prefixes, custom properties)", () => {
    expect(kinds("-webkit-font-smoothing --brand")).toEqual([
      "ident:-webkit-font-smoothing",
      "ident:--brand",
    ]);
  });

  it("skips line and block comments", () => {
    expect(kinds("a // comment\n/* block\nspanning */ b")).toEqual(["ident:a", "ident:b"]);
  });

  it("tracks line and column positions", () => {
    const lx = new Lexer("a\n  bb", "test.arv");
    lx.next();
    const tok = lx.next();
    expect(tok.span).toMatchObject({ line: 2, col: 3 });
  });

  it("tokenizes @ and | for theme modes and responsive syntax", () => {
    expect(kinds("@")).toEqual(["at:@"]);
    expect(kinds("light | dark")).toEqual(["ident:light", "pipe:|", "ident:dark"]);
  });

  it("errors on unexpected characters", () => {
    expect(() => kinds("$")).toThrowError(ArviaError);
  });

  describe("rawValue", () => {
    const value = (src: string) => new Lexer(src, "test.arv").rawValue().text;

    it("stops at semicolons and braces", () => {
      expect(value("1px solid red; next")).toBe("1px solid red");
      expect(value("flex }")).toBe("flex");
    });

    it("keeps semicolons inside parens and strings", () => {
      expect(value("url(a;b);")).toBe("url(a;b)");
      expect(value('"a;b";')).toBe('"a;b"');
    });

    it("errors on unterminated strings", () => {
      expect(() => value('"abc;')).toThrowError(ArviaError);
    });

    it("errors on empty values", () => {
      expect(() => value(";")).toThrowError(ArviaError);
    });
  });

  describe("rawSelector", () => {
    const selector = (src: string) => new Lexer(src, "test.arv").rawSelector().text;

    it("reads up to the brace and collapses whitespace", () => {
      expect(selector("html,\n  body {")).toBe("html, body");
      expect(selector("* {")).toBe("*");
    });

    it("errors when the brace never comes", () => {
      expect(() => selector("html")).toThrowError(ArviaError);
      expect(() => selector("html }")).toThrowError(ArviaError);
    });
  });
});
