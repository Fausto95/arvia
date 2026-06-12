import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compile, compileDts } from "../src/index.js";

const buttonSource = readFileSync(
  fileURLToPath(new URL("./fixtures/button.arv", import.meta.url)),
  "utf8",
);

describe("compileDts", () => {
  it("matches the declarations produced by full compilation", () => {
    const full = compile(buttonSource, { filename: "button.arv" });
    const fast = compileDts(buttonSource, { filename: "button.arv" });
    expect(fast.dts).toBe(full.dts);
  });

  it("works without an environment: unknown tokens and recipes do not affect types", () => {
    const source =
      "component X { use NoSuchRecipe; color: nosuchgroup.token; variants { tone { a {} b {} } } }";
    // Full compilation fails on the unknown recipe…
    expect(compile(source, { filename: "x.arv" }).dts).toBeNull();
    // …but the type surface is unaffected, so compileDts succeeds.
    const { dts } = compileDts(source, { filename: "x.arv" });
    expect(dts).toContain('tone: "a" | "b";');
    expect(dts).toContain("export declare function X(props: XProps): XSlots;");
  });

  it("requires variants without a defaults entry", () => {
    const required = compileDts("component X { variants { tone { a {} b {} } } }", {
      filename: "x.arv",
    });
    expect(required.dts).toContain('tone: "a" | "b";');
    expect(required.dts).toContain("export declare function X(props: XProps): XSlots;");

    const defaulted = compileDts(
      "component X { variants { tone { a {} b {} } } defaults { tone: a; } }",
      { filename: "x.arv" },
    );
    expect(defaulted.dts).toContain('tone?: "a" | "b";');
    expect(defaulted.dts).toContain("export declare function X(props?: XProps): XSlots;");
  });

  it("requires props when any variant lacks a default", () => {
    const { dts } = compileDts(
      "component X { variants { tone { a {} b {} } size { sm {} md {} } } defaults { size: sm; } }",
      { filename: "x.arv" },
    );
    expect(dts).toContain('tone: "a" | "b";');
    expect(dts).toContain('size?: "sm" | "md";');
    expect(dts).toContain("export declare function X(props: XProps): XSlots;");
  });

  it("requires `initial` in the responsive object form of a required variant", () => {
    const source = `theme { breakpoint { md = 768px; } }
component X {
  variants { tone { a {} b {} } size { sm {} md {} } }
  defaults { size: sm; }
  responsive { md { tone: b; size: md; } }
}`;
    const { dts } = compileDts(source, { filename: "x.arv" });
    expect(dts).toContain('tone: "a" | "b" | { initial: "a" | "b"; md?: "a" | "b"; };');
    expect(dts).toContain('size?: "sm" | "md" | { initial?: "sm" | "md"; md?: "sm" | "md"; };');
  });

  it("recovers types past parse errors", () => {
    // A syntax error inside one component must not nuke types for the file.
    const { dts, anchors } = compileDts(
      "component X { color red }\ncomponent Y { variants { tone { a {} } } }",
      { filename: "x.arv" },
    );
    expect(dts).toContain("export declare function X(): XSlots;");
    expect(dts).toContain("export declare function Y(props: YProps): YSlots;");
    expect(anchors.map((a) => a.name)).toEqual(["X", "Y"]);
  });

  it("produces anchors linking generated identifiers to source name spans", () => {
    const source = "component Badge { variants { tone { a {} } } }\ncomponent Chip {}";
    const { dts, anchors } = compileDts(source, { filename: "x.arv" });
    expect(anchors.map((a) => a.name)).toEqual(["Badge", "Chip"]);
    for (const anchor of anchors) {
      expect(
        dts!.slice(anchor.generatedStart, anchor.generatedStart + anchor.generatedLength),
      ).toBe(anchor.name);
      expect(dts!.slice(anchor.generatedStart - "function ".length, anchor.generatedStart)).toBe(
        "function ",
      );
      expect(source.slice(anchor.sourceStart, anchor.sourceStart + anchor.sourceLength)).toBe(
        anchor.name,
      );
    }
  });

  it("returns no anchors for component-less files", () => {
    const result = compileDts("theme { color { a = red; } }", { filename: "t.arv" });
    // Theme files export their tokens; only the component/style declarations
    // get anchors.
    expect(result.dts).toContain("export declare const tokens:");
    expect(result.anchors).toEqual([]);

    const empty = compileDts("global { body { margin: 0; } }", { filename: "g.arv" });
    expect(empty.dts).toContain("export {};");
    expect(empty.anchors).toEqual([]);
  });
});
