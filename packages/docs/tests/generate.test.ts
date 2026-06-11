import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateDocs } from "../src/index.js";

const cleanups: string[] = [];

afterEach(() => {
  while (cleanups.length) fs.rmSync(cleanups.pop()!, { recursive: true, force: true });
});

describe("generateDocs", () => {
  it("emits markdown token tables", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "arvia-docs-"));
    cleanups.push(root);
    const theme = path.join(root, "theme.arv");
    fs.writeFileSync(
      theme,
      `theme {
  color {
    primary = #635bff doc "Brand primary";
  }
}`,
    );

    const result = generateDocs({ theme, outDir: "docs" });
    expect(result.errors).toEqual([]);
    expect(result.files).toHaveLength(1);
    const md = fs.readFileSync(result.files[0]!, "utf8");
    expect(md).toContain("Brand primary");
    expect(md).toContain("`--arvia-color-primary`");
  });
});
