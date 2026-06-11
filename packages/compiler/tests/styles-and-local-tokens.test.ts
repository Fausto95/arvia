import { describe, expect, it } from "vitest";
import { compile, compileDts } from "../src/index.js";
import { hashName } from "../src/ir/hash.js";

const codes = (source: string) =>
  compile(source, { filename: "test.arv" }).diagnostics.map((d) => d.code);

describe("style declarations", () => {
  const SOURCE = `
    theme { color { accent = #635bff; } }
    recipe Surface { background: white; }
    style panel {
      use Surface;
      color: color.accent;
      &:hover { color: red; }
    }
  `;

  it("emits a hashed class, an exported const and a typed declaration", () => {
    const result = compile(SOURCE, { filename: "test.arv" });
    const h = hashName("test.arv", "panel");
    expect(result.diagnostics).toEqual([]);
    expect(result.css).toContain(`.panel_${h} {`);
    expect(result.css).toContain(`.panel_${h}:hover {`);
    expect(result.css).toContain("background: white;");
    expect(result.css).toContain("color: #635bff;");
    expect(result.js).toContain(`export const panel = "panel_${h}";`);
    expect(result.dts).toContain("export declare const panel: string;");
    expect(result.meta.styles).toEqual([{ name: "panel", hash: h, className: `panel_${h}` }]);
  });

  it("emits styles after components in the CSS (utilities-last)", () => {
    const result = compile("component Box { color: red; }\nstyle util { color: blue; }", {
      filename: "test.arv",
    });
    expect(result.css!.indexOf(".util_")).toBeGreaterThan(result.css!.indexOf(".Box_root_"));
  });

  it("supports styles-only files as valid modules", () => {
    const result = compile("style truncate { overflow: hidden; }", { filename: "test.arv" });
    expect(result.js).toContain("export const truncate =");
    expect(result.js).not.toContain("const _h");
    expect(result.dts).toContain("export declare const truncate: string;");
    expect(result.dts).not.toContain("export {};");
  });

  it("rejects slots/variants inside a style with a graduation hint", () => {
    const result = compile("style bad { variants { tone { a {} } } }", { filename: "test.arv" });
    const all = result.diagnostics.map((d) => `${d.message} ${d.hint ?? ""}`).join("\n");
    expect(all).toContain("use a component for slots and variants");
  });

  it("ARV117: duplicate style names and style/component clashes", () => {
    expect(codes("style a { color: red; } style a { color: blue; }")).toEqual(["ARV117"]);
    expect(codes("component a {} style a { color: red; }")).toEqual(["ARV117"]);
  });

  it("ARV116: style names must be valid JS identifiers", () => {
    expect(codes("style my-util { color: red; }")).toEqual(["ARV116"]);
  });

  it("hints when 'use' references a style instead of a recipe", () => {
    const result = compile("style util { color: red; } component X { use util; }", {
      filename: "test.arv",
    });
    expect(result.diagnostics[0]).toMatchObject({ code: "ARV102" });
    expect(result.diagnostics[0]!.hint).toContain("is a style");
  });

  it("style edits keep js/dts byte-identical (HMR guarantee)", () => {
    const a = compile("style util { color: red; }", { filename: "test.arv" });
    const b = compile("style util { color: blue; }", { filename: "test.arv" });
    expect(a.js).toBe(b.js);
    expect(a.dts).toBe(b.dts);
    expect(a.css).not.toBe(b.css);
  });

  it("compileDts emits anchors for styles", () => {
    const source = "style truncate { overflow: hidden; }";
    const { dts, anchors } = compileDts(source, { filename: "test.arv" });
    expect(dts).toContain("export declare const truncate: string;");
    expect(anchors).toHaveLength(1);
    const anchor = anchors[0]!;
    expect(dts!.slice(anchor.generatedStart, anchor.generatedStart + anchor.generatedLength)).toBe(
      "truncate",
    );
    expect(source.slice(anchor.sourceStart, anchor.sourceStart + anchor.sourceLength)).toBe(
      "truncate",
    );
  });
});

describe("component-scoped tokens", () => {
  it("locals shadow theme tokens; other names fall through", () => {
    const result = compile(
      `theme { space { 2 = 8px; } }
       component Chip {
         tokens { space { 2 = 4px; pad = 6px; } }
         base { padding: space.pad space.2; }
       }
       component Plain { base { padding: space.2; } }`,
      { filename: "test.arv" },
    );
    expect(result.diagnostics).toEqual([]);
    expect(result.css).toContain("padding: 6px 4px;"); // Chip: both local
    expect(result.css).toContain("padding: 8px;"); // Plain: theme value, no leak
  });

  it("resolves locals inside calc() and states", () => {
    const result = compile(
      `component X {
         tokens { m { gap = 4px; } }
         base {
           margin: calc(m.gap * 3);
           &:hover { margin: m.gap; }
         }
       }`,
      { filename: "test.arv" },
    );
    expect(result.css).toContain("margin: calc(4px * 3);");
    expect(result.css).toContain("margin: 4px;");
  });

  it("locals stay literal under theme modes while theme refs become vars", () => {
    const result = compile(
      `theme {
         modes: light | dark;
         color { text = #111; @dark { text = #eee; } }
       }
       component X {
         tokens { m { pad = 6px; } }
         base { padding: m.pad; color: color.text; }
       }`,
      { filename: "test.arv" },
    );
    expect(result.diagnostics).toEqual([]);
    expect(result.css).toContain("padding: 6px;");
    expect(result.css).toContain("color: var(--arvia-color-text);");
  });

  it("ARV118: duplicate local token", () => {
    expect(
      codes("component X { tokens { m { a = 1px; a = 2px; } } base { margin: m.a; } }"),
    ).toEqual(["ARV118"]);
  });

  it("ARV119: mode overrides are not allowed in component tokens", () => {
    expect(
      codes(
        `theme { modes: light | dark; color { x = #111; } }
         component X { tokens { m { a = 1px; @dark { a = 2px; } } } base { margin: m.a; } }`,
      ),
    ).toEqual(["ARV119"]);
  });

  it("ARV115: duplicate tokens section", () => {
    expect(codes("component X { tokens { m { a = 1px; } } tokens { n { b = 2px; } } }")).toEqual([
      "ARV115",
    ]);
  });

  it("locals are not exported and do not leak into the env", () => {
    const result = compile("component X { tokens { m { a = 1px; } } base { margin: m.a; } }", {
      filename: "test.arv",
    });
    expect(result.env.tokens["m"]).toBeUndefined();
    expect(result.meta.tokens).toEqual([]);
  });
});
