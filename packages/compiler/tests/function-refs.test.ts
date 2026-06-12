import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const THEME = "theme { space { 4 = 16px; } color { a = #111111; b = #222222; } }";

const compileDecl = (decl: string) => {
  const result = compile(`${THEME} component X { ${decl} }`, { filename: "x.arv" });
  return result;
};

describe("token refs inside functions", () => {
  it("resolves refs inside calc()", () => {
    const { css, diagnostics } = compileDecl("width: calc(space.4 * 2);");
    expect(diagnostics).toEqual([]);
    expect(css).toContain("width: calc(16px * 2);");
  });

  it("resolves refs in nested functions and multiple arguments", () => {
    const { css } = compileDecl("padding: clamp(space.4, calc(space.4 + 1vw), 32px);");
    expect(css).toContain("padding: clamp(16px, calc(16px + 1vw), 32px);");
  });

  it("resolves multiple refs inside one function", () => {
    const { css } = compileDecl("background: linear-gradient(color.a, color.b);");
    expect(css).toContain("background: linear-gradient(#111111, #222222);");
  });

  it("reports unknown tokens inside functions with a hint", () => {
    const { diagnostics } = compileDecl("width: calc(space.5 * 2);");
    expect(diagnostics[0]).toMatchObject({ code: "ARV101" });
    expect(diagnostics[0]!.message).toContain("space.5");
  });

  it("leaves quoted content and non-theme dots alone", () => {
    const { css, diagnostics } = compileDecl('background: url("space.4/img.png") no-repeat;');
    expect(diagnostics).toEqual([]);
    expect(css).toContain('url("space.4/img.png")');
  });

  it("does not touch decimals or url paths", () => {
    // Deliberately nonsense CSS — only substitution behavior matters here,
    // so the value-syntax warning is expected.
    const { css, diagnostics } = compileDecl("grid: calc(1.5fr) url(a.png);");
    expect(diagnostics.filter((d) => d.severity === "error")).toEqual([]);
    expect(css).toContain("calc(1.5fr) url(a.png)");
  });
});
