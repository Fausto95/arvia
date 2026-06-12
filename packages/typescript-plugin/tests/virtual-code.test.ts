import { describe, expect, it } from "vitest";
import ts from "typescript";
import { createArviaLanguagePlugin, createArviaVirtualCode } from "../src/languagePlugin";

const SOURCE = `component Badge {
  variants {
    tone {
      a { color: red; }
      b { color: blue; }
    }
  }
}
`;

const snapshotOf = (text: string) => ts.ScriptSnapshot.fromString(text);

describe("arvia language plugin", () => {
  const plugin = createArviaLanguagePlugin(ts);

  it("claims .arv files only", () => {
    expect(plugin.getLanguageId("/a/badge.arv")).toBe("arvia");
    expect(plugin.getLanguageId("/a/badge.ts")).toBeUndefined();
  });

  it("registers the .arv extension with TypeScript", () => {
    expect(plugin.typescript?.extraFileExtensions).toEqual([
      { extension: "arv", isMixedContent: false, scriptKind: ts.ScriptKind.Deferred },
    ]);
  });

  it("produces virtual TypeScript declarations as the snapshot", () => {
    const code = createArviaVirtualCode("/a/badge.arv", snapshotOf(SOURCE));
    const text = code.snapshot.getText(0, code.snapshot.getLength());
    expect(code.languageId).toBe("typescript");
    expect(text).toContain('tone: "a" | "b";');
    expect(text).toContain("export declare function Badge(props: BadgeProps): BadgeSlots;");
  });

  it("maps the generated identifier back to the component name in source", () => {
    const code = createArviaVirtualCode("/a/badge.arv", snapshotOf(SOURCE));
    expect(code.mappings).toHaveLength(1);
    const mapping = code.mappings[0]!;
    const text = code.snapshot.getText(0, code.snapshot.getLength());
    const genStart = mapping.generatedOffsets[0]!;
    const srcStart = mapping.sourceOffsets[0]!;
    const length = mapping.lengths[0]!;
    expect(text.slice(genStart, genStart + length)).toBe("Badge");
    expect(SOURCE.slice(srcStart, srcStart + length)).toBe("Badge");
    expect(mapping.data.navigation).toBe(true);
  });

  it("recovers component types past parse errors", () => {
    const code = createArviaVirtualCode("/a/broken.arv", snapshotOf("component X { color red }"));
    const text = code.snapshot.getText(0, code.snapshot.getLength());
    expect(text).toContain("export declare function X(): XSlots;");
  });

  it("produces an empty module for files with no parsable components", () => {
    const code = createArviaVirtualCode("/a/garbage.arv", snapshotOf("@@@@ {{{"));
    expect(code.snapshot.getText(0, code.snapshot.getLength())).toContain("export {};");
    expect(code.mappings).toEqual([]);
  });
});
