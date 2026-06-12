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
      outDir: "stories/generated",
      theme: "src/theme.arv",
    });
    expect(result.errors).toEqual([]);
    expect(result.files).toHaveLength(1);
    const story = fs.readFileSync(result.files[0]!, "utf8");
    expect(story).toContain('title: "Arvia/Badge"');
    expect(story).toContain("tone_a");
    expect(story).toContain("tone_b");
  });

  it("derives folder-based titles and button-like renders", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "arvia-sb-"));
    cleanups.push(root);
    const atoms = path.join(root, "src", "atoms");
    fs.mkdirSync(atoms, { recursive: true });
    fs.writeFileSync(path.join(root, "src", "theme.arv"), "theme { color { primary = #000; } }\n");
    fs.writeFileSync(
      path.join(atoms, "button.arv"),
      `component Button {
  slots { root {} icon {} label {} }
  variants { size { sm { padding: 4px; } lg { padding: 8px; } } }
  defaults { size: sm; }
}`,
    );

    const result = await generateStorybook({
      cwd: path.join(root, "src"),
      outDir: "stories/generated",
      theme: path.join(root, "src", "theme.arv"),
      includeDirs: ["atoms"],
    });
    expect(result.errors).toEqual([]);
    expect(result.files).toHaveLength(1);
    const story = fs.readFileSync(result.files[0]!, "utf8");
    expect(story).toContain('title: "Atoms/Button"');
    expect(story).toContain('<button type="button" className={styles.root}>');
    expect(story).toContain("styles.icon");
    expect(story).toContain("styles.label");
  });

  it("respects includeDirs filter", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "arvia-sb-"));
    cleanups.push(root);
    const src = path.join(root, "src");
    fs.mkdirSync(path.join(src, "atoms"), { recursive: true });
    fs.mkdirSync(path.join(src, "molecules"), { recursive: true });
    fs.writeFileSync(path.join(src, "theme.arv"), "theme { color { primary = #000; } }\n");
    fs.writeFileSync(
      path.join(src, "atoms", "badge.arv"),
      `component Badge { variants { tone { a { color: red; } } } defaults { tone: a; } }`,
    );
    fs.writeFileSync(
      path.join(src, "molecules", "alert.arv"),
      `component Alert { variants { tone { info { color: blue; } } } defaults { tone: info; } }`,
    );

    const result = await generateStorybook({
      cwd: src,
      outDir: "stories/generated",
      theme: path.join(src, "theme.arv"),
      includeDirs: ["atoms"],
    });
    expect(result.errors).toEqual([]);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]).toContain(`${path.sep}atoms${path.sep}`);
  });

  it("emits style stories with language titles", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "arvia-sb-"));
    cleanups.push(root);
    const language = path.join(root, "src", "language");
    fs.mkdirSync(language, { recursive: true });
    fs.writeFileSync(path.join(root, "src", "theme.arv"), "theme { color { primary = #000; } }\n");
    fs.writeFileSync(
      path.join(language, "style-decl.arv"),
      `style TruncateDemo { overflow: hidden; }`,
    );

    const result = await generateStorybook({
      cwd: path.join(root, "src"),
      outDir: "stories/generated",
      theme: path.join(root, "src", "theme.arv"),
      includeDirs: ["language"],
    });
    expect(result.errors).toEqual([]);
    expect(result.files).toHaveLength(1);
    const story = fs.readFileSync(result.files[0]!, "utf8");
    expect(story).toContain('title: "Language/StyleDecl"');
    expect(story).toContain("TruncateDemo");
  });
});
