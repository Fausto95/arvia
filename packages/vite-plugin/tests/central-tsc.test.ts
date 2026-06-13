import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { compile } from "@arviahq/compiler";
import { afterEach, describe, expect, it } from "vitest";
import { mirrorPathFor } from "../src/dts-paths.js";

/**
 * End-to-end proof that a consumer using central mode can typecheck `.arv`
 * imports with plain `tsc` — no `arvia-tsc`, no tsserver plugin — given the
 * generated mirror under `.arvia/types` and a `rootDirs` overlay in tsconfig.
 * This locks in the resolution mechanism across module-resolution modes.
 */

const tscPath = createRequire(import.meta.url).resolve("typescript/lib/tsc.js");

const STACK = `component Stack {
  base { display: flex; }
  variants {
    gap {
      sm { gap: 4px; }
      lg { gap: 8px; }
    }
  }
}
`;

const CONSUMER = `import { Stack } from "./components/stack.arv";
export const cls: string = Stack({ gap: "sm" }).root;
`;

const cleanups: (() => void)[] = [];
afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()!();
});

/** Scaffolds a consumer project with the central mirror already generated. */
function scaffold(tsconfig: {
  compilerOptions: Record<string, unknown>;
  include: string[];
}): string {
  const root = mkdtempSync(path.join(os.tmpdir(), "arvia-tsc-"));
  cleanups.push(() => rmSync(root, { recursive: true, force: true }));

  const arvPath = path.join(root, "src/components/stack.arv");
  mkdirSync(path.dirname(arvPath), { recursive: true });
  writeFileSync(arvPath, STACK);
  writeFileSync(path.join(root, "src/consumer.ts"), CONSUMER);

  // Generate the mirror exactly where the plugin/CLI would put it.
  const result = compile(STACK, { filename: arvPath, root });
  const mirror = mirrorPathFor({
    arvAbsPath: arvPath,
    sourceRoot: path.join(root, "src"),
    centralDir: path.join(root, ".arvia/types"),
  })!;
  mkdirSync(path.dirname(mirror), { recursive: true });
  writeFileSync(mirror, result.dts!);

  writeFileSync(path.join(root, "package.json"), JSON.stringify({ type: "module" }));
  writeFileSync(path.join(root, "tsconfig.json"), JSON.stringify(tsconfig));
  return root;
}

function runTsc(root: string): { code: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [tscPath, "-p", "tsconfig.json"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, output };
  } catch (error) {
    const e = error as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

const base = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  lib: ["ES2023"],
};

describe("central mode resolves under plain tsc", () => {
  // The mirror name `stack.arv.d.ts` is reached via TS's `.d.ts`-append, which
  // applies under `bundler` (Vite's default) and `node10`/classic — not under
  // `node16`/`nodenext` (see the limitation test below).
  it.each([
    ["bundler", { module: "ESNext", moduleResolution: "bundler" }],
    ["node10", { module: "CommonJS", moduleResolution: "node10" }],
  ])("typechecks a .arv import with rootDirs (%s)", (_name, resolution) => {
    const root = scaffold({
      compilerOptions: { ...base, ...resolution, rootDirs: ["src", ".arvia/types"] },
      include: ["src"],
    });
    const { code, output } = runTsc(root);
    expect(output).toBe("");
    expect(code).toBe(0);
  });

  it("fails to resolve the .arv import without rootDirs (control)", () => {
    const root = scaffold({
      compilerOptions: { ...base, module: "ESNext", moduleResolution: "bundler" },
      include: ["src"],
    });
    const { code, output } = runTsc(root);
    expect(code).not.toBe(0);
    expect(output).toContain("stack.arv");
  });

  // Documented limitation: node16/nodenext don't append `.d.ts`, so the
  // `*.arv.d.ts` mirror is unreachable there even with rootDirs. Such consumers
  // need `moduleResolution: "bundler"` (or the tsserver plugin). Guarding this
  // flags the day TS changes the behavior so the docs can be updated.
  it("does not resolve under nodenext (known limitation)", () => {
    const root = scaffold({
      compilerOptions: {
        ...base,
        module: "NodeNext",
        moduleResolution: "NodeNext",
        rootDirs: ["src", ".arvia/types"],
      },
      include: ["src"],
    });
    expect(runTsc(root).code).not.toBe(0);
  });
});
