import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { getHover } from "../src/hover.js";
import { WorkspaceState } from "../src/workspace.js";
import { analysisOf, at } from "./helpers.js";

const tempDirs: string[] = [];
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

function emptyWorkspace(): WorkspaceState {
  const dir = mkdtempSync(path.join(os.tmpdir(), "arvia-ls-"));
  tempDirs.push(dir);
  return new WorkspaceState(dir);
}

const markdown = (hover: ReturnType<typeof getHover>): string =>
  typeof hover?.contents === "object" && "value" in hover.contents ? hover.contents.value : "";

describe("hover", () => {
  const ws = emptyWorkspace();

  it("shows token value and doc for refs, anywhere in the word", () => {
    const source = `theme { color { primary = #635bff doc "Brand primary"; } }
component X { base { background: color.primary; } }`;
    const analysis = analysisOf(source);
    for (const offset of [
      at(source, "color.primary"), // start of word
      at(source, "color.primary") + 7, // middle
    ]) {
      const text = markdown(getHover(analysis, offset, ws));
      expect(text).toContain("color.primary");
      expect(text).toContain("#635bff");
      expect(text).toContain("Brand primary");
    }
  });

  it("renders a per-mode table and the CSS var under theme modes", () => {
    const source = `theme { modes: light | dark; color { text = #111; @dark { text = #eee; } } }
component X { base { color: color.text; } }`;
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "color.text"), ws));
    expect(text).toContain("| light | `#111` |");
    expect(text).toContain("| dark | `#eee` |");
    expect(text).toContain("var(--arvia-color-text)");
  });

  it("resolves refs inside calc()", () => {
    const source = `theme { space { 4 = 16px; } }
component X { base { width: calc(space.4 * 2); } }`;
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "space.4"), ws));
    expect(text).toContain("space.4");
    expect(text).toContain("16px");
  });

  it("labels component-local tokens", () => {
    const source = `component Chip { tokens { m { pad = 6px; } } base { padding: m.pad; } }`;
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "m.pad"), ws));
    expect(text).toContain("local to `Chip`");
    expect(text).toContain("6px");
  });

  it("shows resolved declarations for use-recipe", () => {
    const source = `recipe Surface { background: white; border: 1px solid #eee; }
component Card { use Surface; }`;
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "Surface", 2), ws));
    expect(text).toContain("recipe Surface");
    expect(text).toContain("background: white;");
  });

  it("summarizes components", () => {
    const source = `component Button { slots { root {} icon {} } variants { tone { a {} b {} } } }`;
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "Button"), ws));
    expect(text).toContain("component Button");
    expect(text).toContain("slots: root, icon");
    expect(text).toContain("tone: a | b");
  });

  it("shows keyframes steps for keyframes refs", () => {
    const source = `keyframes pulse { from { opacity: 1; } to { opacity: 0.5; } }
component X { base { animation: keyframes.pulse 1s; } }`;
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "keyframes.pulse"), ws));
    expect(text).toContain("keyframes pulse");
    expect(text).toContain("from → to");
  });

  it("shows breakpoint sizes in responsive blocks", () => {
    const source = `theme { breakpoint { md = 768px; } }
component X { variants { size { sm {} lg {} } } responsive { md { size: lg; } } }`;
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "md {", 1), ws));
    expect(text).toContain("breakpoint md");
    expect(text).toContain("768px");
  });

  it("uses theme tokens from the workspace theme (cross-file)", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "arvia-ls-app-"));
    tempDirs.push(dir);
    mkdirSync(path.join(dir, "app", "src", "components"), { recursive: true });
    writeFileSync(
      path.join(dir, "app", "src", "theme.arv"),
      'theme { color { primary = #123456 doc "Primary"; } }\n',
    );
    const workspace = new WorkspaceState(dir);
    const file = path.join(dir, "app", "src", "components", "button.arv");
    const source = "component Button { base { background: color.primary; } }";
    const analysis = analysisOf(source, { filename: file, env: workspace.envFor(file) });
    const text = markdown(getHover(analysis, at(source, "color.primary"), workspace));
    expect(text).toContain("#123456");
    expect(text).toContain("Primary");
  });
});
