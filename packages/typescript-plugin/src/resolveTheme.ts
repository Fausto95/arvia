import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile, emptyEnv, type ThemeEnv } from "@arviahq/compiler";

const themeCache = new Map<string, ThemeEnv | undefined>();

function normalizeFilePath(file: string): string {
  if (file.startsWith("file://")) return fileURLToPath(file);
  return path.isAbsolute(file) ? file : path.resolve(file);
}

export function workspaceRootFor(file: string): string {
  const resolved = normalizeFilePath(file);
  let dir = path.dirname(resolved);
  for (;;) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.dirname(resolved);
    dir = parent;
  }
}

export function themePathFor(file: string): string | null {
  const root = workspaceRootFor(normalizeFilePath(file));
  const conventional = path.join(root, "src/theme.arv");
  if (fs.existsSync(conventional)) return conventional;
  return null;
}

export function themeEnvFor(file: string): ThemeEnv | undefined {
  const resolved = normalizeFilePath(file);
  const themePath = themePathFor(resolved);
  if (!themePath || path.resolve(resolved) === path.resolve(themePath)) return undefined;

  const cached = themeCache.get(themePath);
  if (cached !== undefined) return cached;

  const source = fs.readFileSync(themePath, "utf8");
  const result = compile(source, {
    filename: themePath,
    root: workspaceRootFor(resolved),
  });
  const env = result.diagnostics.some((d) => d.severity === "error") ? undefined : result.env;
  themeCache.set(themePath, env);
  return env;
}

export function clearThemeCache(): void {
  themeCache.clear();
}

export { emptyEnv };
