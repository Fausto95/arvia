import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer, type ViteDevServer } from "vite";
import { afterEach, describe, expect, it } from "vitest";
import { arvia, type ArviaOptions } from "../src/index.js";

const cleanups: (() => Promise<void> | void)[] = [];

afterEach(async () => {
  while (cleanups.length > 0) await cleanups.pop()!();
});

async function createApp(
  files: Record<string, string>,
  options?: ArviaOptions,
): Promise<{ root: string; server: ViteDevServer }> {
  const root = realpathSync(mkdtempSync(path.join(os.tmpdir(), "arvia-watch-")));
  cleanups.push(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(root, name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  const server = await createServer({
    root,
    logLevel: "silent",
    configFile: false,
    server: { middlewareMode: true },
    plugins: [arvia(options)],
  });
  cleanups.push(() => server.close());
  await watcherResponsive(server, root);
  return { root, server };
}

/**
 * Files created while chokidar's initial scan is still running are treated as
 * initial content and never emit "add". Drop fresh sentinel files until one
 * is reported, proving the watcher is past its scan and responsive.
 */
async function watcherResponsive(server: ViteDevServer, root: string): Promise<void> {
  let seen = false;
  const onAdd = (file: string) => {
    if (path.basename(file).startsWith(".sentinel-")) seen = true;
  };
  server.watcher.on("add", onAdd);
  try {
    let i = 0;
    await waitFor(() => {
      writeFileSync(path.join(root, `.sentinel-${i++}`), "");
      return seen;
    }, "the file watcher to become responsive");
  } finally {
    server.watcher.off("add", onAdd);
  }
}

async function waitFor(condition: () => boolean | Promise<boolean>, what: string): Promise<void> {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`timed out waiting for ${what}`);
}

const BADGE = `component Badge {
  variants {
    tone {
      a { color: red; }
    }
  }
}
`;

describe("watcher", () => {
  it("writes the d.ts for a brand-new .arv file before anything imports it (dts mode)", async () => {
    const { root } = await createApp({ "src/app.ts": "export {};" }, { dts: true });
    const badge = path.join(root, "src/badge.arv");

    writeFileSync(badge, BADGE);
    await waitFor(() => existsSync(`${badge}.d.ts`), "badge.arv.d.ts to appear");
    expect(readFileSync(`${badge}.d.ts`, "utf8")).toContain(
      "export declare function Badge(props?: BadgeProps): BadgeSlots;",
    );
  });

  it("removes the sibling d.ts when the .arv file is deleted (dts mode)", async () => {
    const { root } = await createApp({ "src/app.ts": "export {};" }, { dts: true });
    const badge = path.join(root, "src/badge.arv");

    writeFileSync(badge, BADGE);
    await waitFor(() => existsSync(`${badge}.d.ts`), "badge.arv.d.ts to appear");

    rmSync(badge);
    await waitFor(() => !existsSync(`${badge}.d.ts`), "badge.arv.d.ts to disappear");
  });

  it("activates a theme file created mid-session", async () => {
    const { root, server } = await createApp({
      "src/button.arv": "component Button { background: color.primary; }\n",
    });
    const cssUrl = `${root}/src/button.arv.css`;

    // No theme yet: the token ref passes through as a literal.
    const before = await server.transformRequest(cssUrl);
    expect(before!.code).toContain("color.primary");

    writeFileSync(path.join(root, "src/theme.arv"), "theme { color { primary = #123456; } }\n");
    await waitFor(async () => {
      const result = await server.transformRequest(cssUrl);
      return result !== null && result.code.includes("#123456");
    }, "button css to pick up the new theme token");
  });

  it("deactivates a deleted conventional theme", async () => {
    const { root, server } = await createApp({
      "src/theme.arv": "theme { color { primary = #123456; } }\n",
      "src/button.arv": "component Button { background: color.primary; }\n",
    });
    const cssUrl = `${root}/src/button.arv.css`;

    const before = await server.transformRequest(cssUrl);
    expect(before!.code).toContain("#123456");

    rmSync(path.join(root, "src/theme.arv"));
    await waitFor(async () => {
      const result = await server.transformRequest(cssUrl);
      return result !== null && result.code.includes("color.primary");
    }, "button css to fall back to the literal token ref");
  });
});
