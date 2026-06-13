import path from "node:path";
import { describe, expect, it } from "vitest";
import { mirrorPathFor } from "../src/dts-paths.js";

const root = path.resolve("/proj");
const sourceRoot = path.join(root, "src");
const centralDir = path.join(root, ".arvia/types");

describe("mirrorPathFor", () => {
  it("mirrors a nested file under the central dir, keeping the literal .arv", () => {
    expect(
      mirrorPathFor({
        arvAbsPath: path.join(sourceRoot, "components/stack.arv"),
        sourceRoot,
        centralDir,
      }),
    ).toBe(path.join(centralDir, "components/stack.arv.d.ts"));
  });

  it("mirrors a file directly at the source root", () => {
    expect(
      mirrorPathFor({ arvAbsPath: path.join(sourceRoot, "theme.arv"), sourceRoot, centralDir }),
    ).toBe(path.join(centralDir, "theme.arv.d.ts"));
  });

  it("preserves path casing exactly (forceConsistentCasingInFileNames)", () => {
    expect(
      mirrorPathFor({
        arvAbsPath: path.join(sourceRoot, "UI/MyCard.arv"),
        sourceRoot,
        centralDir,
      }),
    ).toBe(path.join(centralDir, "UI/MyCard.arv.d.ts"));
  });

  it("returns null for a file outside the source root (caller falls back to sibling)", () => {
    expect(
      mirrorPathFor({ arvAbsPath: path.join(root, "lib/x.arv"), sourceRoot, centralDir }),
    ).toBeNull();
  });
});
