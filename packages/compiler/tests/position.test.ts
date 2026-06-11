import { describe, expect, it } from "vitest";
import { analyze, LineIndex } from "../src/index.js";

describe("LineIndex", () => {
  const text = "abc\ndef\n\nghi";
  const index = new LineIndex(text);

  it("converts offsets to 1-based positions", () => {
    expect(index.positionAt(0)).toEqual({ line: 1, col: 1 });
    expect(index.positionAt(2)).toEqual({ line: 1, col: 3 });
    expect(index.positionAt(4)).toEqual({ line: 2, col: 1 });
    expect(index.positionAt(8)).toEqual({ line: 3, col: 1 }); // empty line
    expect(index.positionAt(9)).toEqual({ line: 4, col: 1 });
    expect(index.positionAt(text.length)).toEqual({ line: 4, col: 4 }); // EOF
  });

  it("converts positions back to offsets, clamping past line ends", () => {
    expect(index.offsetAt({ line: 1, col: 1 })).toBe(0);
    expect(index.offsetAt({ line: 2, col: 2 })).toBe(5);
    expect(index.offsetAt({ line: 1, col: 99 })).toBe(4); // clamped to line end
    expect(index.offsetAt({ line: 99, col: 1 })).toBe(9); // clamped to last line
  });

  it("round-trips every offset", () => {
    for (let offset = 0; offset <= text.length; offset++) {
      expect(index.offsetAt(index.positionAt(offset))).toBe(offset);
    }
  });

  it("produces full ranges from spans", () => {
    const source = "component X {\n  color: notatoken;\n}";
    const idx = new LineIndex(source);
    const start = source.indexOf("notatoken");
    const range = idx.spanToRange({
      start,
      end: start + "notatoken".length,
      line: 2,
      col: 10,
    });
    expect(range.start).toEqual({ line: 2, col: 10 });
    expect(range.end).toEqual({ line: 2, col: 19 });
  });
});

describe("analyze", () => {
  it("returns checker diagnostics and env without running codegen", () => {
    const result = analyze(
      "theme { color { primary = #111; } } component X { color: color.primry; }",
      { filename: "x.arv" },
    );
    expect(result.diagnostics.map((d) => d.code)).toEqual(["ARV101"]);
    expect(result.env.tokens["color"]).toEqual({ primary: "#111" });
    expect(result.ast.items.map((i) => i.kind)).toEqual(["theme", "component"]);
  });

  it("returns the recovered AST when parse errors exist", () => {
    const result = analyze("component X { color red }\ncomponent Y {}", { filename: "x.arv" });
    expect(result.diagnostics.length).toBeGreaterThan(0);
    const names = result.ast.items.map((i) => (i.kind === "component" ? i.name : ""));
    expect(names).toContain("X");
    expect(names).toContain("Y");
  });
});
