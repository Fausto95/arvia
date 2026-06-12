import { describe, expect, it } from "vitest";
import { compile, compileDts } from "../src/index.js";

/** Imports the generated module via a data: URL and returns one export. */
async function load(js: string, name: string): Promise<unknown> {
  const url = `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`;
  const mod = (await import(url)) as Record<string, unknown>;
  if (!(name in mod)) throw new Error(`generated module has no export '${name}'`);
  return mod[name];
}

const MODED_THEME = `theme {
  modes: light | dark;
  color {
    accent = #635bff doc "Primary accent";
    surface = #ffffff;
    @dark { surface = #16161a; }
  }
  space { 1 = 4px; 2 = 8px; }
}`;

const SINGLE_THEME = `theme {
  color { accent = #635bff; }
  font { 2xl = 32px; }
}`;

describe("theme tokens export", () => {
  it("moded themes export var() references", async () => {
    const { js } = compile(MODED_THEME, { filename: "theme.arv" });
    const tokens = (await load(js!, "tokens")) as Record<string, Record<string, string>>;
    expect(tokens.color!.accent).toBe("var(--arvia-color-accent)");
    expect(tokens.color!.surface).toBe("var(--arvia-color-surface)");
    expect(tokens.space!["1"]).toBe("var(--arvia-space-1)");
  });

  it("single-mode themes export resolved literal values", async () => {
    const { js } = compile(SINGLE_THEME, { filename: "theme.arv" });
    const tokens = (await load(js!, "tokens")) as Record<string, Record<string, string>>;
    expect(tokens.color!.accent).toBe("#635bff");
    expect(tokens.font!["2xl"]).toBe("32px");
  });

  it("moded themes type tokens as var() literals with docs and group unions", () => {
    const { dts } = compile(MODED_THEME, { filename: "theme.arv" });
    expect(dts).toContain('readonly accent: "var(--arvia-color-accent)";');
    expect(dts).toContain("/** Primary accent */");
    expect(dts).toContain('export type ColorToken = keyof (typeof tokens)["color"];');
    expect(dts).toContain('export type SpaceToken = keyof (typeof tokens)["space"];');
  });

  it("single-mode themes type token values as string", () => {
    const { dts } = compile(SINGLE_THEME, { filename: "theme.arv" });
    expect(dts).toContain("readonly accent: string;");
    expect(dts).toContain('readonly "2xl": string;');
  });

  it("compileDts on a theme file matches full compilation", () => {
    for (const source of [MODED_THEME, SINGLE_THEME]) {
      const full = compile(source, { filename: "theme.arv" });
      const fast = compileDts(source, { filename: "theme.arv" });
      expect(fast.dts).toBe(full.dts);
    }
  });

  it("files without theme tokens keep the empty module shape", () => {
    const { js, dts } = compile("global { body { margin: 0; } }", { filename: "g.arv" });
    expect(js).toContain("export {};");
    expect(dts).toContain("export {};");
  });

  it("breakpoint and container groups do not produce token exports", () => {
    const { js } = compile("theme { breakpoint { md = 768px; } container { sm = 480px; } }", {
      filename: "theme.arv",
    });
    expect(js).toContain("export {};");
  });

  it("ARV125: component or style named 'tokens' conflicts with the export", () => {
    const componentClash = compile("theme { color { a = red; } } component tokens {}", {
      filename: "theme.arv",
    });
    expect(componentClash.diagnostics.map((d) => d.code)).toContain("ARV125");

    const styleClash = compile("theme { color { a = red; } } style tokens { color: red; }", {
      filename: "theme.arv",
    });
    expect(styleClash.diagnostics.map((d) => d.code)).toContain("ARV125");

    // No theme tokens → no export → no clash.
    const noTheme = compile("component tokens {}", { filename: "x.arv" });
    expect(noTheme.diagnostics.map((d) => d.code)).not.toContain("ARV125");
  });
});
