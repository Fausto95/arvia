import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";
import { hashName } from "../src/ir/hash.js";

const compileOk = (source: string) => {
  const result = compile(source, { filename: "test.arv" });
  expect(result.diagnostics.filter((d) => d.severity === "error")).toEqual([]);
  return result;
};

describe("state selector lists", () => {
  it("emits one rule per list with the class substituted for every part", () => {
    const { css } = compileOk("component X { base { &:hover, &:focus-visible { color: red; } } }");
    const h = hashName("test.arv", "X");
    expect(css).toContain(`.X_root_${h}:hover,\n.X_root_${h}:focus-visible {`);
    expect(css).not.toContain("&");
  });

  it("keeps commas inside brackets and parens intact", () => {
    const { css } = compileOk(
      'component X { base { &[data-x="a,b"], &:not(:disabled, .off) { color: red; } } }',
    );
    const h = hashName("test.arv", "X");
    expect(css).toContain(`.X_root_${h}[data-x="a,b"],\n.X_root_${h}:not(:disabled, .off) {`);
  });

  it("works in recipes and styles too", () => {
    const { css } = compileOk(
      "recipe R { &:hover, &:focus { outline: none; } } style util { use R; }",
    );
    const h = hashName("test.arv", "util");
    expect(css).toContain(`.util_${h}:hover,\n.util_${h}:focus {`);
  });
});

describe("combinators in states", () => {
  it("preserves descendant whitespace after &", () => {
    const { css } = compileOk("component X { base { & .child { color: red; } } }");
    const h = hashName("test.arv", "X");
    expect(css).toContain(`.X_root_${h} .child {`);
  });

  it("preserves child combinators", () => {
    const { css } = compileOk("component X { base { & > svg { width: 1em; } } }");
    const h = hashName("test.arv", "X");
    expect(css).toContain(`.X_root_${h} > svg {`);
  });

  it("keeps compound attachment when there is no gap", () => {
    const { css } = compileOk("component X { base { &.active { color: red; } } }");
    const h = hashName("test.arv", "X");
    expect(css).toContain(`.X_root_${h}.active {`);
  });

  it("handles mixed lists of descendant and suffix parts", () => {
    const { css } = compileOk("component X { base { &:hover, & .icon { color: red; } } }");
    const h = hashName("test.arv", "X");
    expect(css).toContain(`.X_root_${h}:hover,\n.X_root_${h} .icon {`);
  });
});

describe("group hover (cross-slot states)", () => {
  it("targets the slot's base class from the root state", () => {
    const { css } = compileOk(
      `component Button {
         slots { root {} icon {} }
         base {
           &:hover {
             opacity: 0.9;
             icon { transform: scale(1.1); }
           }
         }
       }`,
    );
    const h = hashName("test.arv", "Button");
    expect(css).toContain(`.Button_root_${h}:hover {\n  opacity: 0.9;\n}`);
    expect(css).toContain(
      `.Button_root_${h}:hover .Button_icon_${h} {\n  transform: scale(1.1);\n}`,
    );
  });

  it("works from variant bodies, targeting the base slot class", () => {
    const { css } = compileOk(
      `component Button {
         slots { root {} icon {} }
         variants { tone { danger { &:hover { icon { color: red; } } } } }
       }`,
    );
    const h = hashName("test.arv", "Button");
    expect(css).toContain(`.Button_tone_danger_root_${h}:hover .Button_icon_${h} {`);
  });

  it("expands selector lists across slot targets", () => {
    const { css } = compileOk(
      `component X {
         slots { root {} icon {} }
         base { &:hover, &:focus { icon { color: red; } } }
       }`,
    );
    const h = hashName("test.arv", "X");
    expect(css).toContain(`.X_root_${h}:hover .X_icon_${h},\n.X_root_${h}:focus .X_icon_${h} {`);
  });

  it("ARV120 on unknown slot targets", () => {
    const result = compile(
      "component X { slots { icon {} } base { &:hover { icno { color: red; } } } }",
      { filename: "test.arv" },
    );
    expect(result.diagnostics[0]).toMatchObject({ code: "ARV120" });
    expect(result.diagnostics[0]!.hint).toContain("icon");
  });

  it("rejects slot blocks in states outside component bodies", () => {
    const result = compile("recipe R { &:hover { icon { color: red; } } }", {
      filename: "test.arv",
    });
    const all = result.diagnostics.map((d) => `${d.message} ${d.hint ?? ""}`).join("\n");
    expect(all).toContain("only allowed in 'base' and variant bodies");
  });
});

describe("token aliases in theme values", () => {
  it("resolves aliases and composite values against earlier tokens", () => {
    const { css, env } = compileOk(
      `theme {
         color { base = #111; accent = color.base; }
         border { thin = 1px solid color.accent; }
       }
       component X { base { border: border.thin; } }`,
    );
    expect(env.tokens["color"]!["accent"]).toBe("#111");
    expect(css).toContain("border: 1px solid #111;");
  });

  it("resolves alias chains", () => {
    const { env } = compileOk("theme { color { a = #1; b = color.a; c = color.b; } }");
    expect(env.tokens["color"]!["c"]).toBe("#1");
  });

  it("reports forward references with ARV101", () => {
    const result = compile("theme { color { b = color.a; a = #111; } }", {
      filename: "test.arv",
    });
    expect(result.diagnostics[0]).toMatchObject({ code: "ARV101" });
    expect(result.diagnostics[0]!.message).toContain("color.a");
  });

  it("aliases follow per-mode values under theme modes", () => {
    const { css } = compileOk(
      `theme {
         modes: light | dark;
         color {
           base = #111;
           @dark { base = #eee; }
           text = color.base;
         }
       }`,
    );
    // The alias's CSS var must carry both mode values resolved from `base`.
    expect(css).toContain("--arvia-color-text: #111;");
    expect(css).toMatch(/data-arvia-theme="dark"[^}]*--arvia-color-text: #eee/s);
  });

  it("leaves non-theme dots and keyframes refs alone in theme values", () => {
    const { env } = compileOk("theme { grid { area = main.start; } }");
    expect(env.tokens["grid"]!["area"]).toBe("main.start");
  });
});
