import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const SOURCE = `
component Button {
  base { color: red; }
  variants {
    tone {
      danger { background: crimson; }
    }
  }
}
`;

describe("determinism", () => {
  it("compiles to byte-identical output across runs", () => {
    const a = compile(SOURCE, { filename: "src/button.arv", root: "/proj" });
    const b = compile(SOURCE, { filename: "src/button.arv", root: "/proj" });
    expect(a.css).toBe(b.css);
    expect(a.js).toBe(b.js);
    expect(a.dts).toBe(b.dts);
  });

  it("keeps js and dts byte-identical across pure style edits (HMR guarantee)", () => {
    const edited = SOURCE.replace("color: red;", "color: blue;").replace(
      "background: crimson;",
      "background: tomato;",
    );
    const a = compile(SOURCE, { filename: "src/button.arv" });
    const b = compile(edited, { filename: "src/button.arv" });
    expect(a.js).toBe(b.js);
    expect(a.dts).toBe(b.dts);
    expect(a.css).not.toBe(b.css);
  });

  it("hashes from the root-relative path, not the absolute path", () => {
    const a = compile(SOURCE, {
      filename: "/home/alice/proj/src/button.arv",
      root: "/home/alice/proj",
    });
    const b = compile(SOURCE, {
      filename: "C:\\Users\\bob\\proj\\src\\button.arv",
      root: "C:\\Users\\bob\\proj",
    });
    expect(a.js).toBe(b.js);
  });

  describe("minify (production) names", () => {
    it("compiles to byte-identical output across runs", () => {
      const a = compile(SOURCE, { filename: "src/button.arv", root: "/proj", minify: true });
      const b = compile(SOURCE, { filename: "src/button.arv", root: "/proj", minify: true });
      expect(a.css).toBe(b.css);
      expect(a.js).toBe(b.js);
      expect(a.dts).toBe(b.dts);
    });

    it("keeps js and dts byte-identical across pure style edits (HMR guarantee)", () => {
      const edited = SOURCE.replace("color: red;", "color: blue;").replace(
        "background: crimson;",
        "background: tomato;",
      );
      const a = compile(SOURCE, { filename: "src/button.arv", minify: true });
      const b = compile(edited, { filename: "src/button.arv", minify: true });
      expect(a.js).toBe(b.js);
      expect(a.dts).toBe(b.dts);
      expect(a.css).not.toBe(b.css);
    });

    it("emits short identifier-safe class names with no readable parts", () => {
      const { css, js } = compile(SOURCE, { filename: "src/button.arv", minify: true });
      expect(css).not.toContain("Button_");
      // Every emitted class is a leading-letter hash, distinct, and shared
      // between the CSS rules and the JS runtime maps.
      const classes = [...css!.matchAll(/\.([A-Za-z0-9_-]+)\s*\{/g)].map((m) => m[1]!);
      expect(classes.length).toBeGreaterThan(0);
      for (const cls of classes) {
        expect(cls).toMatch(/^[a-z][a-z0-9]*$/);
        expect(cls).not.toContain("_");
        expect(js).toContain(`"${cls}"`);
      }
      expect(new Set(classes).size).toBe(classes.length);
    });

    it("leaves the .d.ts identical to the readable build (types are name-independent)", () => {
      const readable = compile(SOURCE, { filename: "src/button.arv" });
      const minified = compile(SOURCE, { filename: "src/button.arv", minify: true });
      expect(minified.dts).toBe(readable.dts);
    });
  });
});
