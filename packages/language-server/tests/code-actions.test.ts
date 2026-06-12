import { describe, expect, it } from "vitest";
import type { Diagnostic as LspDiagnostic, TextEdit } from "vscode-languageserver";
import { getCodeActions } from "../src/code-actions.js";
import { toLspDiagnostics } from "../src/diagnostics.js";
import { lintDiagnostics } from "../src/lints.js";
import { analysisOf } from "./helpers.js";

const URI = "file:///proj/src/test.arv";

function actionsFor(source: string, diagnostics: LspDiagnostic[]) {
  return getCodeActions(analysisOf(source), { diagnostics }, URI);
}

/** Applies single-file TextEdits to the source (edits must not overlap). */
function apply(source: string, edits: TextEdit[]): string {
  const lineStarts = [0];
  for (let i = 0; i < source.length; i++) if (source[i] === "\n") lineStarts.push(i + 1);
  const offsetOf = (pos: { line: number; character: number }) =>
    lineStarts[pos.line]! + pos.character;
  const sorted = edits.toSorted((a, b) => offsetOf(b.range.start) - offsetOf(a.range.start));
  let out = source;
  for (const edit of sorted) {
    out =
      out.slice(0, offsetOf(edit.range.start)) + edit.newText + out.slice(offsetOf(edit.range.end));
  }
  return out;
}

describe("code actions: did-you-mean quick fixes", () => {
  it("fixes a token typo end to end", () => {
    const source =
      "theme { color { primary = #635bff; } }\ncomponent X { base { background: color.primry; } }";
    const analysis = analysisOf(source);
    const published = toLspDiagnostics(analysis);
    const actions = getCodeActions(analysis, { diagnostics: published }, URI);
    expect(actions).toHaveLength(1);
    expect(actions[0]!.title).toBe("Change to 'color.primary'");
    expect(actions[0]!.isPreferred).toBe(true);
    const fixed = apply(source, actions[0]!.edit!.changes![URI]!);
    expect(fixed).toContain("background: color.primary;");
  });

  it("recovers the fix when the client drops diagnostic data", () => {
    const source =
      "theme { color { primary = #635bff; } }\ncomponent X { base { background: color.primry; } }";
    const analysis = analysisOf(source);
    const stripped = toLspDiagnostics(analysis).map((d) => ({ ...d, data: undefined }));
    const actions = getCodeActions(analysis, { diagnostics: stripped }, URI);
    expect(actions).toHaveLength(1);
    expect(actions[0]!.title).toBe("Change to 'color.primary'");
  });

  it("offers nothing for diagnostics without fixes", () => {
    const source = "component X {} component X {}"; // ARV110, no suggestion
    const analysis = analysisOf(source);
    const actions = getCodeActions(analysis, { diagnostics: toLspDiagnostics(analysis) }, URI);
    expect(actions).toHaveLength(0);
  });
});

describe("lints: missing defaults", () => {
  it("publishes a hint and inserts a defaults block with first values", () => {
    const source = `component X {
  variants {
    tone { primary {} ghost {} }
    size { sm {} md {} }
  }
}`;
    const analysis = analysisOf(source);
    const lints = lintDiagnostics(analysis);
    const missing = lints.filter((l) => l.code === "missing-defaults");
    expect(missing).toHaveLength(1);

    const actions = actionsFor(source, missing);
    expect(actions).toHaveLength(1);
    expect(actions[0]!.isPreferred).toBe(false);
    const fixed = apply(source, actions[0]!.edit!.changes![URI]!);
    expect(fixed).toContain("defaults { tone: primary; size: sm; }");
    // Inserted after the variants block, inside the component.
    expect(analysisOf(fixed).diagnostics).toEqual([]);
  });

  it("does not fire when defaults exist or the file has errors", () => {
    const withDefaults = analysisOf(
      "component X { variants { tone { a {} } } defaults { tone: a; } }",
    );
    expect(lintDiagnostics(withDefaults)).toHaveLength(0);

    const broken = analysisOf("component X { variants { tone { a {} } } use NoSuchRecipe; }");
    expect(broken.diagnostics.some((d) => d.severity === "error")).toBe(true);
    expect(lintDiagnostics(broken)).toHaveLength(0);
  });
});

describe("lints: unused slot", () => {
  it("flags an empty, unreferenced slot and removes it", () => {
    const source = `component X {
  slots {
    icon { color: red; }
    ghost {}
  }
}`;
    const analysis = analysisOf(source);
    const unused = lintDiagnostics(analysis).filter((l) => l.code === "unused-slot");
    expect(unused).toHaveLength(1);
    expect(unused[0]!.message).toContain("ghost");

    const actions = actionsFor(source, unused);
    expect(actions[0]!.title).toContain("may be used from TSX");
    expect(actions[0]!.isPreferred).toBe(false);
    const fixed = apply(source, actions[0]!.edit!.changes![URI]!);
    expect(fixed).not.toContain("ghost");
    expect(analysisOf(fixed).diagnostics).toEqual([]);
  });

  it("keeps slots that are styled or referenced", () => {
    const styled = analysisOf("component X { slots { icon { color: red; } } }");
    expect(lintDiagnostics(styled)).toHaveLength(0);

    const referenced = analysisOf(`component X {
  slots { icon {} }
  base { &:hover { icon { color: red; } } }
}`);
    expect(lintDiagnostics(referenced)).toHaveLength(0);

    const root = analysisOf("component X { slots { root {} } }");
    expect(lintDiagnostics(root)).toHaveLength(0);
  });

  it("removes the whole slots block when removing the only slot", () => {
    const source = "component X {\n  slots { ghost {} }\n  base { color: red; }\n}";
    const analysis = analysisOf(source);
    const unused = lintDiagnostics(analysis).filter((l) => l.code === "unused-slot");
    expect(unused).toHaveLength(1);
    const actions = actionsFor(source, unused);
    const fixed = apply(source, actions[0]!.edit!.changes![URI]!);
    expect(fixed).not.toContain("slots");
    expect(analysisOf(fixed).diagnostics).toEqual([]);
  });
});
