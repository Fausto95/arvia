import { describe, expect, it } from "vitest";
import { parse } from "../src/parser/parser.js";

import type { ComponentDecl, RecipeDecl, ThemeBlock } from "../src/ast/nodes.js";

const KITCHEN_SINK = `
theme {
  color {
    primary = #635bff;
    danger = #e5484d;
  }
  space {
    1 = 4px;
    4 = 16px;
  }
}

global {
  html, body {
    margin: 0;
  }
  * {
    box-sizing: border-box;
  }
}

recipe Surface {
  border: 1px solid #e5e5e5;
  &:hover {
    border-color: #d0d0d0;
  }
}

component Button {
  padding: space.4;
  use Surface;

  base {
    display: inline-flex;
    icon {
      flex-shrink: 0;
    }
    &:focus-visible {
      outline: 2px solid color.primary;
    }
  }

  slots {
    root {}
    icon {}
    label {
      font-weight: 500;
    }
  }

  variants {
    size {
      sm { font-size: 12px; }
      lg { font-size: 16px; icon { width: 20px; } }
    }
    tone {
      primary { background: color.primary; }
      danger { background: color.danger; }
    }
  }

  defaults {
    size: sm;
    tone: primary;
  }

  compound {
    size: sm;
    tone: danger;
    root {
      font-weight: 600;
    }
  }
}
`;

describe("parser", () => {
  it("parses the kitchen sink", () => {
    const { ast: file } = parse(KITCHEN_SINK, "test.arv");
    expect(file.items.map((i) => i.kind)).toEqual(["theme", "global", "recipe", "component"]);

    const theme = file.items[0] as ThemeBlock;
    expect(theme.groups.map((g) => g.name)).toEqual(["color", "space"]);
    expect(theme.groups[1]!.entries.map((e) => [e.name, e.value.text])).toEqual([
      ["1", "4px"],
      ["4", "16px"],
    ]);

    const recipe = file.items[2] as RecipeDecl;
    expect(recipe.name).toBe("Surface");
    expect(recipe.items.map((i) => i.kind)).toEqual(["decl", "state"]);

    const component = file.items[3] as ComponentDecl;
    expect(component.name).toBe("Button");
    expect(component.items.map((i) => i.kind)).toEqual([
      "decl",
      "use",
      "base",
      "slots",
      "variants",
      "defaults",
      "compound",
    ]);
  });

  it("parses global rules with raw selectors", () => {
    const { ast: file } = parse("global { html, body { margin: 0; } }", "test.arv");
    const global = file.items[0]!;
    if (global.kind !== "global") throw new Error("expected global");
    expect(global.rules[0]!.selector).toBe("html, body");
    expect(global.rules[0]!.decls[0]).toMatchObject({ property: "margin" });
  });

  it("classifies token refs in values", () => {
    const { ast: file } = parse("component X { border: 1px solid color.primary; }", "test.arv");
    const component = file.items[0] as ComponentDecl;
    const decl = component.items[0]!;
    if (decl.kind !== "decl") throw new Error("expected decl");
    expect(decl.value.words.map((w) => `${w.kind}:${w.text}`)).toEqual([
      "literal:1px",
      "literal:solid",
      "ref:color.primary",
    ]);
  });

  it("does not classify numeric-led words as refs", () => {
    const { ast: file } = parse("component X { grid: 1.5fr auto; }", "test.arv");
    const component = file.items[0] as ComponentDecl;
    const decl = component.items[0]!;
    if (decl.kind !== "decl") throw new Error("expected decl");
    expect(decl.value.words.map((w) => w.kind)).toEqual(["literal", "literal"]);
  });

  it("records candidate refs inside parenthesized groups", () => {
    const { ast: file } = parse("component X { width: calc(space.4 * 2); }", "test.arv");
    const component = file.items[0] as ComponentDecl;
    const decl = component.items[0]!;
    if (decl.kind !== "decl") throw new Error("expected decl");
    expect(decl.value.words.map((w) => `${w.kind}:${w.text}`)).toEqual([
      "literal:calc(space.4 * 2)",
      "ref:space.4",
    ]);
  });

  it("treats section keywords as contextual", () => {
    // `base` used as a CSS property name inside a slot block.
    const { ast: file } = parse("component X { base { icon { base: 1px; } } }", "test.arv");
    expect(file.items[0]!.kind).toBe("component");
  });

  it("parses state blocks with attribute selectors", () => {
    const { ast: file } = parse(
      'component X { base { &[data-active="true"] { color: red; } } }',
      "test.arv",
    );
    const component = file.items[0] as ComponentDecl;
    const base = component.items[0]!;
    if (base.kind !== "base") throw new Error("expected base");
    const state = base.body.items[0]!;
    if (state.kind !== "state") throw new Error("expected state");
    expect(state.selectors).toEqual(['[data-active="true"]']);
  });

  const failsWith = (src: string, fragment: string) => {
    const { diagnostics } = parse(src, "test.arv");
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics.map((d) => `${d.message} ${d.hint ?? ""}`).join("\n")).toContain(fragment);
  };

  it("rejects unknown top-level constructs", () => {
    failsWith(
      "widget X {}",
      "expected 'theme', 'global', 'recipe', 'keyframes', 'style' or 'component'",
    );
  });

  it("rejects missing semicolons", () => {
    failsWith("component X { color: red }", "';' after value of 'color'");
  });

  it("rejects nested slot blocks", () => {
    failsWith("component X { base { icon { label { color: red; } } } }", "cannot be nested");
  });

  it("rejects use inside state blocks", () => {
    failsWith(
      "recipe R { color: red; } component X { base { &:hover { use R; } } }",
      "not allowed inside state blocks",
    );
  });

  it("rejects unexpected blocks at component level with a hint", () => {
    failsWith("component X { icon { color: red; } }", "unexpected block 'icon'");
  });

  it("rejects matcher garbage in compound blocks", () => {
    failsWith("component X { compound { 600; } }", "a variant matcher or slot block");
  });
});

describe("parser error recovery", () => {
  it("reports every error in one pass", () => {
    const { ast, diagnostics } = parse(
      `component X {
        color red;
        background blue;
        padding: 4px;
      }`,
      "test.arv",
    );
    expect(diagnostics.length).toBe(2);
    expect(diagnostics[0]!.message).toContain("expected ':' or '{' after 'color'");
    expect(diagnostics[1]!.message).toContain("expected ':' or '{' after 'background'");
    const component = ast.items[0] as ComponentDecl;
    expect(component.items.some((i) => i.kind === "decl" && i.property === "padding")).toBe(true);
  });

  it("keeps parsing valid items around a bad one", () => {
    const { ast, diagnostics } = parse(
      `component X {
        color red;
        padding: 4px;
        variants { size { sm { font-size: 12px; } } }
      }`,
      "test.arv",
    );
    expect(diagnostics).toHaveLength(1);
    const component = ast.items[0] as ComponentDecl;
    expect(component.items.map((i) => i.kind)).toEqual(["decl", "variants"]);
  });

  it("recovers across top-level constructs", () => {
    const { ast, diagnostics } = parse(
      `component Broken { @@@ }
       component Fine { color: red; }
       recipe R { background: white; }`,
      "test.arv",
    );
    expect(diagnostics.length).toBeGreaterThan(0);
    const names = ast.items.map((i) =>
      i.kind === "component" || i.kind === "recipe" ? i.name : "",
    );
    expect(names).toContain("Fine");
    expect(names).toContain("R");
  });

  it("skips a whole malformed nested block via brace tracking", () => {
    const { ast, diagnostics } = parse(
      `component X {
        bogus { stuff { deeply nested } garbage }
        padding: 4px;
      }`,
      "test.arv",
    );
    expect(diagnostics.length).toBeGreaterThan(0);
    const component = ast.items[0] as ComponentDecl;
    expect(component.items.some((i) => i.kind === "decl" && i.property === "padding")).toBe(true);
  });

  it("recovers in theme blocks per entry", () => {
    const { ast, diagnostics } = parse(
      `theme {
        color {
          good = #111111;
          bad #222222;
          alsoGood = #333333;
        }
      }`,
      "test.arv",
    );
    expect(diagnostics).toHaveLength(1);
    const theme = ast.items[0] as ThemeBlock;
    expect(theme.groups[0]!.entries.map((e) => e.name)).toEqual(["good", "alsoGood"]);
  });

  it("terminates on pathological input", () => {
    const { diagnostics } = parse("{{{{ ;;; }}}} @@@@ component", "test.arv");
    expect(diagnostics.length).toBeGreaterThan(0);
  });

  it("caps recorded errors", () => {
    const bad = Array.from({ length: 300 }, (_, i) => `color${i} red;`).join("\n");
    const { diagnostics } = parse(`component X { ${bad} }`, "test.arv");
    expect(diagnostics.length).toBeLessThanOrEqual(100);
  });

  it("parses token doc metadata without including it in the value", () => {
    const { ast } = parse(`theme { color { primary = #635bff doc "Brand primary"; } }`, "test.arv");
    const theme = ast.items[0] as ThemeBlock;
    const entry = theme.groups[0]!.entries[0]!;
    expect(entry.value.text).toBe("#635bff");
    expect(entry.doc).toBe("Brand primary");
  });
});
