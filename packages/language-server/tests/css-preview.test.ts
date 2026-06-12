import { describe, expect, it } from "vitest";
import { getHover } from "../src/hover.js";
import { nullThemeHost } from "../src/theme-host.js";
import { analysisOf, at } from "./helpers.js";

const SOURCE = `component Button {
  slots { icon {} }
  base {
    color: red;
    icon { display: flex; }
  }
  variants {
    tone {
      primary { background: blue; }
      danger { background: crimson; icon { fill: white; } }
    }
  }
  defaults { tone: primary; }
}

style Truncate { overflow: hidden; }

keyframes spin { from { opacity: 0; } }`;

const hoverText = (source: string, needle: string, occurrence = 1): string => {
  const hover = getHover(analysisOf(source), at(source, needle, occurrence), nullThemeHost);
  return hover && typeof hover.contents === "object" && "value" in hover.contents
    ? hover.contents.value
    : "";
};

describe("compiled-CSS hover preview", () => {
  it("component name shows its full compiled CSS", () => {
    const text = hoverText(SOURCE, "Button");
    expect(text).toContain("```css");
    expect(text).toContain("color: red;");
    expect(text).toContain("background: blue;");
  });

  it("variant value shows only that value's rules", () => {
    const text = hoverText(SOURCE, "danger");
    expect(text).toContain("background: crimson;");
    expect(text).toContain("fill: white;");
    expect(text).not.toContain("background: blue;");
    expect(text).not.toContain("color: red;");
  });

  it("slot shows only that slot's rules across base and variants", () => {
    const text = hoverText(SOURCE, "icon");
    expect(text).toContain("display: flex;");
    expect(text).toContain("fill: white;");
    expect(text).not.toContain("color: red;");
  });

  it("style and keyframes names preview their blocks", () => {
    expect(hoverText(SOURCE, "Truncate")).toContain("overflow: hidden;");
    const spin = hoverText(SOURCE, "spin");
    expect(spin).toContain("@keyframes");
    expect(spin).toContain("opacity: 0;");
  });

  it("long previews are truncated", () => {
    const decls = Array.from({ length: 40 }, (_, i) => `--x-${i}: ${i}px;`).join(" ");
    const text = hoverText(`component Big { base { ${decls} } }`, "Big");
    expect(text).toContain("/* … */");
  });

  it("skips previews when the file has errors (summary hover remains)", () => {
    const broken = "component X { use NoSuchRecipe; }";
    const text = hoverText(broken, "X");
    expect(text).toContain("component X");
    expect(text).not.toContain("```css");
  });
});
