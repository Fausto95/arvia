import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { getDocumentColors, parseColor } from "../src/colors.js";
import { getHover } from "../src/hover.js";
import { getInlayHints } from "../src/inlay-hints.js";
import { getRenameEdits, prepareRename, readFileOr } from "../src/rename.js";
import { WorkspaceState } from "../src/workspace.js";
import { analysisOf, at } from "./helpers.js";

const tempDirs: string[] = [];
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

function tempWorkspace(): { dir: string; workspace: WorkspaceState } {
  const dir = mkdtempSync(path.join(os.tmpdir(), "arvia-lsp3-"));
  tempDirs.push(dir);
  return { dir, workspace: new WorkspaceState(dir) };
}

const markdown = (hover: ReturnType<typeof getHover>): string =>
  typeof hover?.contents === "object" && "value" in hover.contents ? hover.contents.value : "";

const FULL_RANGE = { start: { line: 0, character: 0 }, end: { line: 999, character: 9999 } };

describe("css property hover", () => {
  const { workspace } = tempWorkspace();

  it("shows MDN description, syntax and link", () => {
    const source = "component X { base { gap: 8px; } }";
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "gap"), workspace));
    expect(text).toContain("**gap**");
    expect(text).toContain("row-gap");
    expect(text).toContain("MDN Reference");
  });

  it("labels custom properties", () => {
    const source = "component X { base { --brand: red; } }";
    const analysis = analysisOf(source);
    const text = markdown(getHover(analysis, at(source, "--brand"), workspace));
    expect(text).toContain("CSS custom property");
  });
});

describe("color decorators", () => {
  it("parses hex, rgb and hsl", () => {
    expect(parseColor("#ff0000")).toEqual({ red: 1, green: 0, blue: 0, alpha: 1 });
    expect(parseColor("#f00")).toEqual({ red: 1, green: 0, blue: 0, alpha: 1 });
    expect(parseColor("rgb(255, 0, 0)")).toEqual({ red: 1, green: 0, blue: 0, alpha: 1 });
    expect(parseColor("rgba(255, 0, 0, 0.5)")).toMatchObject({ red: 1, alpha: 0.5 });
    expect(parseColor("hsl(0, 100%, 50%)")).toMatchObject({ red: 1, green: 0, blue: 0 });
    expect(parseColor("16px")).toBeNull();
    expect(parseColor("url(a.png)")).toBeNull();
  });

  it("decorates theme entries and declaration literals", () => {
    const source = `theme { color { primary = #635bff; } }
component X { base { border: 1px solid #ff0000; background: rgb(0, 128, 0); } }`;
    const colors = getDocumentColors(analysisOf(source));
    expect(colors).toHaveLength(3);
    const lines = colors.map((c) => c.range.start.line);
    expect(lines).toContain(0); // theme entry
    expect(lines.filter((l) => l === 1)).toHaveLength(2); // both decl literals
  });
});

describe("inlay hints", () => {
  it("shows resolved token values after refs", () => {
    const source = `theme { space { 4 = 16px; } }
component X { base { padding: space.4 calc(space.4 * 2); } }`;
    const hints = getInlayHints(analysisOf(source), FULL_RANGE);
    expect(hints).toHaveLength(2);
    expect(hints[0]!.label).toBe(" = 16px");
    // The hint sits right after the ref.
    expect(hints[0]!.position.line).toBe(1);
  });

  it("uses local token values and first-mode values", () => {
    const source = `theme { modes: light | dark; color { text = #111; @dark { text = #eee; } } }
component X { tokens { m { pad = 6px; } } base { padding: m.pad; color: color.text; } }`;
    const hints = getInlayHints(analysisOf(source), FULL_RANGE);
    expect(hints.map((h) => h.label)).toEqual([" = 6px", " = #111"]);
  });
});

describe("rename", () => {
  it("prepares rename for tokens but not component names", () => {
    const source = `theme { color { primary = #111; } }
component Button { base { color: color.primary; } }`;
    const analysis = analysisOf(source);
    expect(prepareRename(analysis, at(source, "primary ="))).toMatchObject({
      placeholder: "primary",
    });
    expect(prepareRename(analysis, at(source, "Button"))).toBeNull();
  });

  it("renames a token: entry, refs, aliases and mode overrides in one file", () => {
    const source = `theme {
  modes: light | dark;
  color { primary = #111; @dark { primary = #eee; } accent = color.primary; }
}
component X { base { background: color.primary; } }`;
    const analysis = analysisOf(source, { filename: "/proj/src/theme.arv" });
    const { workspace } = tempWorkspace();
    const edit = getRenameEdits(
      analysis,
      at(source, "color.primary"),
      "brand",
      workspace,
      readFileOr,
    );
    const edits = Object.values(edit!.changes!)[0]!;
    const texts = edits.map((e) => e.newText).sort();
    // base entry + @dark override entry + alias ref + component ref
    expect(texts).toEqual(["brand", "brand", "color.brand", "color.brand"]);
  });

  it("renames across files when the token lives in a shared theme", () => {
    const { dir, workspace } = tempWorkspace();
    mkdirSync(path.join(dir, "src", "components"), { recursive: true });
    const themePath = path.join(dir, "src", "theme.arv");
    const buttonPath = path.join(dir, "src", "components", "button.arv");
    writeFileSync(themePath, "theme { color { primary = #111; } }\n");
    writeFileSync(buttonPath, "component Button { base { background: color.primary; } }\n");

    const themeSource = readFileOr(themePath)!;
    const analysis = analysisOf(themeSource, {
      filename: themePath,
      env: workspace.envFor(themePath),
    });
    const edit = getRenameEdits(
      analysis,
      at(themeSource, "primary"),
      "brand",
      workspace,
      readFileOr,
    );
    expect(edit).not.toBeNull();
    const uris = Object.keys(edit!.changes!);
    expect(uris).toContain(pathToFileURL(themePath).toString());
    expect(uris).toContain(pathToFileURL(buttonPath).toString());
    const buttonEdits = edit!.changes![pathToFileURL(buttonPath).toString()]!;
    expect(buttonEdits[0]!.newText).toBe("color.brand");
  });

  it("local token rename stays inside its component", () => {
    const source = `theme { m { pad = 1px; } }
component A { tokens { m { pad = 6px; } } base { padding: m.pad; } }
component B { base { padding: m.pad; } }`;
    const analysis = analysisOf(source);
    const { workspace } = tempWorkspace();
    const edit = getRenameEdits(analysis, at(source, "m.pad"), "gap", workspace, readFileOr);
    const edits = Object.values(edit!.changes!)[0]!;
    // local entry + component A's ref only — theme entry and B's ref untouched.
    expect(edits).toHaveLength(2);
  });

  it("renames variant values across defaults and compound matchers", () => {
    const source = `component X {
  variants { tone { primary {} danger {} } }
  defaults { tone: danger; }
  compound { tone: danger; root { color: red; } }
}`;
    const analysis = analysisOf(source);
    const { workspace } = tempWorkspace();
    const edit = getRenameEdits(analysis, at(source, "danger"), "critical", workspace, readFileOr);
    const edits = Object.values(edit!.changes!)[0]!;
    expect(edits).toHaveLength(3); // value decl + defaults + compound matcher
  });

  it("rejects invalid new names", () => {
    const source = "recipe Surface { color: red; } component X { use Surface; }";
    const analysis = analysisOf(source);
    const { workspace } = tempWorkspace();
    expect(
      getRenameEdits(analysis, at(source, "Surface"), "1 bad name", workspace, readFileOr),
    ).toBeNull();
  });
});
