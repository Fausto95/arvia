import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateStorybook } from "../src/index.js";

const cleanups: string[] = [];

afterEach(() => {
  while (cleanups.length) fs.rmSync(cleanups.pop()!, { recursive: true, force: true });
});

describe("generateStorybook", () => {
  it("emits CSF stories for components", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "arvia-sb-"));
    cleanups.push(root);
    const src = path.join(root, "src");
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(path.join(src, "theme.arv"), "theme { color { primary = #000; } }\n");
    fs.writeFileSync(
      path.join(src, "badge.arv"),
      `component Badge {
  variants { tone { a { color: red; } b { color: blue; } } }
  defaults { tone: a; }
}`,
    );

    const result = await generateStorybook({
      cwd: root,
      outDir: "stories",
      theme: "src/theme.arv",
    });
    expect(result.errors).toEqual([]);
    expect(result.files).toHaveLength(1);
    const story = fs.readFileSync(result.files[0]!, "utf8");
    expect(story).toContain('title: "Arvia/Badge"');
    expect(story).toContain("tone_a");
    expect(story).toContain("tone_b");
  });
});
