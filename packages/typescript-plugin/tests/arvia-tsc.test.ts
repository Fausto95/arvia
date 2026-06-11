import { execFileSync, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const pkgDir = fileURLToPath(new URL("..", import.meta.url));
const cli = path.join(pkgDir, "dist", "cli.cjs");

function runArviaTsc(project: string): { status: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [cli, "-p", project, "--noEmit"], {
      cwd: pkgDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, output };
  } catch (error) {
    const e = error as { status?: number; stdout?: string; stderr?: string };
    return { status: e.status ?? 1, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

beforeAll(() => {
  if (!existsSync(cli)) {
    execSync("npx tsup", { cwd: pkgDir, stdio: "inherit" });
  }
});

describe("arvia-tsc", () => {
  it("typechecks .arv imports with no .d.ts files on disk", () => {
    const fixture = path.join(pkgDir, "tests", "fixtures", "ok");
    expect(existsSync(path.join(fixture, "button.arv.d.ts"))).toBe(false);
    const { status, output } = runArviaTsc(fixture);
    expect(output).not.toMatch(/error TS/);
    expect(status).toBe(0);
  });

  it("rejects invalid variant values with a TS error", () => {
    const fixture = path.join(pkgDir, "tests", "fixtures", "bad");
    const { status, output } = runArviaTsc(fixture);
    expect(status).not.toBe(0);
    expect(output).toContain('"warning"');
    expect(output).toMatch(/error TS2322|error TS2345/);
  });
});
