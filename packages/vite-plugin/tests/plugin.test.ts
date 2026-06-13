import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build, createServer, type Rollup } from "vite";
import { afterAll, describe, expect, it } from "vitest";
import { arvia } from "../src/index.js";

const appRoot = fileURLToPath(new URL("./fixtures/app", import.meta.url));
const dtsFiles = [
  path.join(appRoot, "src/theme.arv.d.ts"),
  path.join(appRoot, "src/button.arv.d.ts"),
];
const centralDir = path.join(appRoot, ".arvia/types");

const cleanDts = () => {
  for (const file of dtsFiles) rmSync(file, { force: true });
  rmSync(path.join(appRoot, ".arvia"), { recursive: true, force: true });
};

afterAll(cleanDts);

async function buildApp(options?: Parameters<typeof arvia>[0]): Promise<Rollup.RollupOutput> {
  const result = await build({
    root: appRoot,
    logLevel: "silent",
    plugins: [arvia(options)],
    build: { write: false },
  });
  return result as Rollup.RollupOutput;
}

describe("@arviahq/vite-plugin", () => {
  it("compiles .arv imports into extracted CSS and working JS, with short hashed class names in a production build", async () => {
    cleanDts();
    const { output } = await buildApp();

    const css = output.find(
      (o): o is Rollup.OutputAsset => o.type === "asset" && o.fileName.endsWith(".css"),
    );
    expect(css, "a CSS asset should be emitted").toBeDefined();
    const cssSource = String(css!.source);
    // Global styles from the theme file plus component styles, minified.
    expect(cssSource).toContain("box-sizing:border-box");
    // Theme tokens and recipes resolved into the component's CSS.
    expect(cssSource).toContain("padding:8px 16px");
    expect(cssSource).toContain("background:#e5484d");

    // Production build: readable names are gone — every class is a short,
    // identifier-safe hash (leading letter + base36 tail).
    expect(cssSource).not.toContain("Button_root_");
    const classes = [...cssSource.matchAll(/\.([a-z][a-z0-9]{7})\s*\{/g)].map((m) => m[1]!);
    expect(classes.length).toBeGreaterThan(0);

    const entry = output.find((o): o is Rollup.OutputChunk => o.type === "chunk" && o.isEntry);
    expect(entry!.code).not.toContain("Button_root_");
    // CSS ↔ JS agreement: the runtime references the very same hashed classes.
    for (const cls of classes) expect(entry!.code).toContain(cls);
  });

  it("keeps readable class names in dev (serve mode)", async () => {
    cleanDts();
    const server = await createServer({
      root: appRoot,
      logLevel: "silent",
      configFile: false,
      server: { middlewareMode: true },
      plugins: [arvia({ dts: false })],
    });
    try {
      const result = await server.transformRequest("/src/button.arv");
      expect(result, "the .arv module should transform").not.toBeNull();
      // Dev keeps the debuggable `Component_variant_value_slot_hash` form.
      expect(result!.code).toContain("Button_root_");
      expect(result!.code).toContain("Button_tone_danger_root_");
    } finally {
      await server.close();
    }
  });

  it("defaults to central mode: mirrors into .arvia/types with a self-ignoring .gitignore, no siblings", async () => {
    cleanDts();
    await buildApp();
    expect(existsSync(dtsFiles[0]!)).toBe(false);
    expect(existsSync(dtsFiles[1]!)).toBe(false);
    expect(existsSync(path.join(centralDir, "button.arv.d.ts"))).toBe(true);
    expect(readFileSync(path.join(centralDir, ".gitignore"), "utf8")).toBe("*\n!.gitignore\n");
  });

  it("writes no files at all with dts: false (types come from @arviahq/typescript-plugin)", async () => {
    cleanDts();
    await buildApp({ dts: false });
    expect(existsSync(dtsFiles[0]!)).toBe(false);
    expect(existsSync(dtsFiles[1]!)).toBe(false);
    expect(existsSync(centralDir)).toBe(false);
  });

  it("writes sibling .d.ts files with dts: true, byte-stable across builds", async () => {
    cleanDts();
    await buildApp({ dts: true });

    expect(existsSync(dtsFiles[0]!)).toBe(true);
    expect(existsSync(dtsFiles[1]!)).toBe(true);

    const buttonDts = readFileSync(dtsFiles[1]!, "utf8");
    expect(buttonDts).toContain('tone?: "primary" | "danger";');
    expect(buttonDts).toContain(
      "export declare function Button(props?: ButtonProps): ButtonSlots;",
    );

    await buildApp({ dts: true });
    expect(readFileSync(dtsFiles[1]!, "utf8")).toBe(buttonDts);
  });

  it("mirrors .d.ts into the central dir with dts: 'central', byte-stable across builds", async () => {
    cleanDts();
    await buildApp({ dts: "central" });

    const buttonMirror = path.join(centralDir, "button.arv.d.ts");
    const themeMirror = path.join(centralDir, "theme.arv.d.ts");
    expect(existsSync(buttonMirror)).toBe(true);
    expect(existsSync(themeMirror)).toBe(true);
    // No sibling files written in central mode.
    expect(existsSync(dtsFiles[1]!)).toBe(false);

    const mirror = readFileSync(buttonMirror, "utf8");
    expect(mirror).toContain("export declare function Button(props?: ButtonProps): ButtonSlots;");

    await buildApp({ dts: "central" });
    expect(readFileSync(buttonMirror, "utf8")).toBe(mirror);
  });

  it("sweeps a stale central mirror whose .arv source no longer exists", async () => {
    cleanDts();
    const ghost = path.join(centralDir, "ghost.arv.d.ts");
    mkdirSync(centralDir, { recursive: true });
    writeFileSync(ghost, "export {};\n");

    await buildApp({ dts: "central" });

    // The build's buildEnd sweep removes the orphan but keeps real mirrors.
    expect(existsSync(ghost)).toBe(false);
    expect(existsSync(path.join(centralDir, "button.arv.d.ts"))).toBe(true);
  });

  it("warns when two files define the same component name", async () => {
    const collisionRoot = fileURLToPath(new URL("./fixtures/collision", import.meta.url));
    const warnings: string[] = [];
    await build({
      root: collisionRoot,
      logLevel: "silent",
      plugins: [arvia({ dts: false })],
      build: {
        write: false,
        rollupOptions: {
          onwarn: (warning) => warnings.push(warning.message),
        },
      },
    });
    const collision = warnings.find((w) => w.includes("defined in multiple files"));
    expect(collision).toBeDefined();
    expect(collision).toContain("Button");
    expect(collision).toContain("src/a.arv");
    expect(collision).toContain("src/b.arv");
  });

  it("fails the build with a located diagnostic on bad input", async () => {
    const badRoot = fileURLToPath(new URL("./fixtures/bad", import.meta.url));
    await expect(
      build({
        root: badRoot,
        logLevel: "silent",
        plugins: [arvia({ dts: false })],
        build: { write: false },
      }),
    ).rejects.toThrowError(/ARV101.*color\.primry/s);
  });
});
