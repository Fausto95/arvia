import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const codes = (source: string) =>
  compile(source, { filename: "test.arv" }).diagnostics.map((d) => d.code);

const firstDiag = (source: string) => compile(source, { filename: "test.arv" }).diagnostics[0];

describe("checker diagnostics", () => {
  it("ARV101: unknown token ref, with did-you-mean", () => {
    const d = firstDiag(
      "theme { color { primary = #635bff; } } component X { background: color.primry; }",
    );
    expect(d).toMatchObject({ code: "ARV101", severity: "error" });
    expect(d!.hint).toContain("color.primary");
  });

  it("attaches a structured fix to did-you-mean diagnostics", () => {
    const source =
      "theme { color { primary = #635bff; } } component X { background: color.primry; }";
    const d = firstDiag(source);
    expect(d!.fix).toBeDefined();
    expect(d!.fix!.title).toBe("Change to 'color.primary'");
    expect(d!.fix!.edits).toHaveLength(1);
    const edit = d!.fix!.edits[0]!;
    expect(source.slice(edit.span.start, edit.span.end)).toBe("color.primry");
    expect(edit.newText).toBe("color.primary");
  });

  it("attaches fixes to variant-value typos in defaults", () => {
    const source =
      "component X { variants { tone { primary {} ghost {} } } defaults { tone: primry; } }";
    const d = firstDiag(source);
    expect(d).toMatchObject({ code: "ARV124" });
    const edit = d!.fix!.edits[0]!;
    expect(source.slice(edit.span.start, edit.span.end)).toBe("primry");
    expect(edit.newText).toBe("primary");
  });

  it("omits fix when there is no suggestion", () => {
    const d = firstDiag("theme { color { x = red; } } component X { background: color.zzzzzz; }");
    expect(d).toMatchObject({ code: "ARV101" });
    expect(d!.fix).toBeUndefined();
  });

  it("ARV101: only fires for known theme groups", () => {
    // `foo.bar` is not a theme group → passes through as literal CSS.
    expect(codes("theme { color { x = red; } } component X { grid-area: foo.bar; }")).toEqual([]);
  });

  it("ARV102: unknown recipe", () => {
    expect(codes("component X { use Surfase; }")).toEqual(["ARV102"]);
  });

  it("ARV103: recipe cycle", () => {
    expect(codes("recipe A { use B; } recipe B { use A; }")).toContain("ARV103");
  });

  it("ARV110: duplicate component", () => {
    expect(codes("component X {} component X {}")).toEqual(["ARV110"]);
  });

  it("ARV111: duplicate recipe", () => {
    expect(codes("recipe R { color: red; } recipe R { color: blue; }")).toEqual(["ARV111"]);
  });

  it("ARV112: duplicate theme group and token", () => {
    expect(codes("theme { color { a = red; a = blue; } }")).toEqual(["ARV112"]);
    expect(codes("theme { color { a = red; } color { b = blue; } }")).toEqual(["ARV112"]);
  });

  it("ARV113: duplicate slot", () => {
    expect(codes("component X { slots { icon {} icon {} } }")).toEqual(["ARV113"]);
  });

  it("ARV114: duplicate variant and value", () => {
    expect(codes("component X { variants { size { sm {} } size { lg {} } } }")).toEqual(["ARV114"]);
    expect(codes("component X { variants { size { sm {} sm {} } } }")).toEqual(["ARV114"]);
  });

  it("ARV115: duplicate section block", () => {
    expect(codes("component X { base { color: red; } base { color: blue; } }")).toEqual(["ARV115"]);
  });

  it("ARV116: component name must be a JS identifier", () => {
    expect(codes("component my-button {}")).toEqual(["ARV116"]);
    expect(codes("component default {}")).toEqual(["ARV116"]);
  });

  it("ARV120: unknown slot in sub-block", () => {
    const d = firstDiag("component X { slots { icon {} } base { icno { color: red; } } }");
    expect(d).toMatchObject({ code: "ARV120" });
    expect(d!.hint).toContain("icon");
  });

  it("ARV121: compound references unknown variant", () => {
    expect(
      codes(
        "component X { variants { size { sm {} } } compound { tone: danger; root { color: red; } } }",
      ),
    ).toEqual(["ARV121"]);
  });

  it("ARV122: compound references unknown value", () => {
    expect(
      codes(
        "component X { variants { size { sm {} } } compound { size: xl; root { color: red; } } }",
      ),
    ).toEqual(["ARV122"]);
  });

  it("ARV123: empty compound warns but does not fail compilation", () => {
    const result = compile("component X { compound { } }", { filename: "test.arv" });
    expect(result.diagnostics.map((d) => [d.code, d.severity])).toEqual([
      ["ARV123", "warning"],
      ["ARV123", "warning"],
    ]);
    expect(result.css).not.toBeNull();
  });

  it("ARV124: defaults referencing unknown variant or value", () => {
    expect(
      codes("component X { variants { size { sm {} } } defaults { tone: primary; } }"),
    ).toEqual(["ARV124"]);
    expect(codes("component X { variants { size { sm {} } } defaults { size: xl; } }")).toEqual([
      "ARV124",
    ]);
  });

  it("ARV126: duplicate matcher in one compound", () => {
    expect(
      codes(
        "component X { variants { size { sm {} lg {} } } compound { size: sm; size: lg; root { color: red; } } }",
      ),
    ).toEqual(["ARV126"]);
  });

  it("returns null artifacts when errors exist", () => {
    const result = compile("component X { use Nope; }", { filename: "test.arv" });
    expect(result.css).toBeNull();
    expect(result.js).toBeNull();
    expect(result.dts).toBeNull();
  });

  it("merges a passed-in env (theme file pattern)", () => {
    const theme = compile(
      "theme { color { primary = #635bff; } } recipe Surface { background: white; }",
      { filename: "theme.arv" },
    );
    expect(theme.diagnostics).toEqual([]);

    const result = compile("component X { use Surface; color: color.primary; }", {
      filename: "x.arv",
      env: theme.env,
    });
    expect(result.diagnostics).toEqual([]);
    expect(result.css).toContain("background: white;");
    expect(result.css).toContain("color: #635bff;");
  });

  it("lets file definitions extend env tokens", () => {
    const theme = compile("theme { color { primary = red; } }", { filename: "theme.arv" });
    const result = compile(
      "theme { color { local = blue; } } component X { color: color.local; background: color.primary; }",
      { filename: "x.arv", env: theme.env },
    );
    expect(result.diagnostics).toEqual([]);
    expect(result.css).toContain("color: blue;");
    expect(result.css).toContain("background: red;");
  });
});
