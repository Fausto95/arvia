import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { getDefinition } from "../src/definition.js";
import { toLspDiagnostics } from "../src/diagnostics.js";
import { getDocumentSymbols } from "../src/symbols.js";
import { WorkspaceState } from "../src/workspace.js";
import { analysisOf, at } from "./helpers.js";

const tempDirs: string[] = [];
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

function tempWorkspace(): { dir: string; workspace: WorkspaceState } {
  const dir = mkdtempSync(path.join(os.tmpdir(), "arvia-ls-def-"));
  tempDirs.push(dir);
  return { dir, workspace: new WorkspaceState(dir) };
}

describe("go-to-definition", () => {
  it("token ref → entry in the same file's theme block", () => {
    const { workspace } = tempWorkspace();
    const source = `theme { color { primary = #111; } }
component X { base { color: color.primary; } }`;
    const analysis = analysisOf(source);
    const location = getDefinition(analysis, at(source, "color.primary"), workspace);
    expect(location).not.toBeNull();
    // Lands on the `primary` entry name on line 1.
    expect(location!.range.start.line).toBe(0);
    expect(source.slice(0, source.indexOf("primary = "))).toContain("color {");
  });

  it("token ref → theme.arv in a parent directory (monorepo walk-up)", () => {
    const { dir, workspace } = tempWorkspace();
    mkdirSync(path.join(dir, "app", "src", "components"), { recursive: true });
    const themePath = path.join(dir, "app", "src", "theme.arv");
    writeFileSync(themePath, "theme {\n  color {\n    primary = #123456;\n  }\n}\n");
    const file = path.join(dir, "app", "src", "components", "button.arv");
    const source = "component Button { base { background: color.primary; } }";
    const analysis = analysisOf(source, { filename: file, env: workspace.envFor(file) });

    const location = getDefinition(analysis, at(source, "color.primary"), workspace);
    expect(location).not.toBeNull();
    expect(location!.uri).toBe(pathToFileURL(themePath).toString());
    expect(location!.range.start.line).toBe(2); // `primary` line in theme.arv
  });

  it("local token shadows the theme for definition", () => {
    const { workspace } = tempWorkspace();
    const source = `theme { m { pad = 1px; } }
component Chip { tokens { m { pad = 6px; } } base { padding: m.pad; } }`;
    const analysis = analysisOf(source);
    const location = getDefinition(analysis, at(source, "m.pad"), workspace);
    expect(location).not.toBeNull();
    expect(location!.range.start.line).toBe(1); // the component's tokens block
  });

  it("use → recipe declaration; defaults value → variant value", () => {
    const { workspace } = tempWorkspace();
    const source = `recipe Surface { background: white; }
component X {
  use Surface;
  variants { tone { a {} b {} } }
  defaults { tone: b; }
}`;
    const analysis = analysisOf(source);

    const recipeLoc = getDefinition(analysis, at(source, "Surface", 2), workspace);
    expect(recipeLoc!.range.start.line).toBe(0);

    const valueLoc = getDefinition(analysis, source.indexOf("tone: b") + 7, workspace);
    expect(valueLoc!.range.start.line).toBe(3); // `b {}` inside variants
  });
});

describe("document symbols", () => {
  it("builds the outline tree", () => {
    const source = `theme { color { primary = #111; } }
recipe Surface { background: white; }
style truncate { overflow: hidden; }
component Button {
  slots { root {} icon {} }
  variants { tone { a {} b {} } }
}`;
    const symbols = getDocumentSymbols(analysisOf(source));
    expect(symbols.map((s) => s.name)).toEqual(["theme", "Surface", "truncate", "Button"]);
    const button = symbols[3]!;
    expect(button.children!.map((c) => c.name)).toEqual(["root", "icon", "tone"]);
    expect(button.children![2]!.children!.map((c) => c.name)).toEqual(["a", "b"]);
  });
});

describe("diagnostic ranges", () => {
  it("covers the full offending span, not a guessed width", () => {
    const source = `theme { color { primary = #111; } }
component X { base { background: color.primry; } }`;
    const analysis = analysisOf(source);
    const [diag] = toLspDiagnostics(analysis);
    expect(diag).toBeDefined();
    const refStart = source.split("\n")[1]!.indexOf("color.primry");
    expect(diag!.range.start).toEqual({ line: 1, character: refStart });
    expect(diag!.range.end).toEqual({ line: 1, character: refStart + "color.primry".length });
    expect(diag!.code).toBe("ARV101");
    expect(diag!.message).toContain("did you mean");
  });
});
