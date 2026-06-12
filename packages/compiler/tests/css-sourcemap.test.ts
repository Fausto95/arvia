import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const SOURCE = `component Button {
  base { color: red; }
}

style Truncate { overflow: hidden; }

keyframes spin { from { opacity: 0; } }
`;

/** Decodes one base64-VLQ segment list per line: [genCol, srcIdx, line, col]. */
function decodeMappings(mappings: string): (number[] | null)[] {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  return mappings.split(";").map((segment) => {
    if (segment === "") return null;
    const values: number[] = [];
    let shift = 0;
    let value = 0;
    for (const char of segment) {
      const digit = CHARS.indexOf(char);
      value |= (digit & 0b11111) << shift;
      if (digit & 0b100000) {
        shift += 5;
      } else {
        values.push(value & 1 ? -(value >>> 1) : value >>> 1);
        shift = 0;
        value = 0;
      }
    }
    return values;
  });
}

describe("CSS source maps", () => {
  it("maps each rule's first line back to its declaring name", () => {
    const { css, cssMap } = compile(SOURCE, { filename: "button.arv" });
    expect(cssMap).not.toBeNull();
    expect(cssMap!.sources).toEqual(["button.arv"]);
    expect(cssMap!.sourcesContent).toEqual([SOURCE]);

    const decoded = decodeMappings(cssMap!.mappings);
    const cssLines = css!.split("\n");
    const sourceLines = SOURCE.split("\n");

    // Accumulate absolute source positions (VLQ deltas chain across lines).
    let srcLine = 0;
    const anchors: { cssLine: string; sourceLine: string }[] = [];
    for (let i = 0; i < decoded.length; i++) {
      const seg = decoded[i];
      if (!seg) continue;
      srcLine += seg[2]!;
      anchors.push({ cssLine: cssLines[i]!, sourceLine: sourceLines[srcLine]! });
    }

    const find = (cssNeedle: string) => anchors.find((a) => a.cssLine.includes(cssNeedle));
    expect(find("@keyframes")!.sourceLine).toContain("keyframes spin");
    expect(find(".Truncate")!.sourceLine).toContain("style Truncate");
    expect(find(".Button_root")!.sourceLine).toContain("component Button");
  });

  it("is null when compilation fails", () => {
    const { cssMap } = compile("component X { use Nope; }", { filename: "x.arv" });
    expect(cssMap).toBeNull();
  });
});
