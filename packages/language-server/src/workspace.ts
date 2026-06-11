import fs from "node:fs";
import path from "node:path";
import { analyze, LineIndex, type ArviaFile, type ThemeEnv } from "@arviahq/compiler";

export interface ThemeInfo {
  path: string;
  /** undefined when the theme itself has errors. */
  env: ThemeEnv | undefined;
  ast: ArviaFile;
  source: string;
  index: LineIndex;
}

export class WorkspaceState {
  /** themePath → loaded theme (null = path unreadable). */
  private themes = new Map<string, ThemeInfo | null>();
  /** directory → resolved theme path for documents in it (null = none found). */
  private themeByDir = new Map<string, string | null>();

  constructor(readonly root: string) {}

  /**
   * Nearest theme for a document: starting at its directory and walking up to
   * the workspace root, check `theme.arv` then `src/theme.arv` at each level.
   * Supports monorepos with one theme per app/package.
   */
  themePathFor(file: string): string | null {
    const resolved = path.resolve(file);
    if (path.basename(resolved) === "theme.arv") return resolved;

    let dir = path.dirname(resolved);
    const visited: string[] = [];
    let result: string | null = null;
    for (;;) {
      const cached = this.themeByDir.get(dir);
      if (cached !== undefined) {
        result = cached;
        break;
      }
      visited.push(dir);
      const direct = path.join(dir, "theme.arv");
      if (fs.existsSync(direct)) {
        result = direct;
        break;
      }
      const conventional = path.join(dir, "src", "theme.arv");
      if (fs.existsSync(conventional)) {
        result = conventional;
        break;
      }
      const parent = path.dirname(dir);
      if (dir === path.resolve(this.root) || parent === dir) {
        result = null;
        break;
      }
      dir = parent;
    }
    for (const d of visited) this.themeByDir.set(d, result);
    return result;
  }

  themeFor(file: string): ThemeInfo | null {
    const themePath = this.themePathFor(file);
    if (!themePath) return null;
    let info = this.themes.get(themePath);
    if (info === undefined) {
      info = this.loadTheme(themePath);
      this.themes.set(themePath, info);
    }
    return info;
  }

  /** Shared env for a document — undefined for the theme file itself. */
  envFor(file: string): ThemeEnv | undefined {
    const theme = this.themeFor(file);
    if (!theme || theme.path === path.resolve(file)) return undefined;
    return theme.env;
  }

  private loadTheme(themePath: string): ThemeInfo | null {
    let source: string;
    try {
      source = fs.readFileSync(themePath, "utf8");
    } catch {
      return null;
    }
    const result = analyze(source, { filename: themePath });
    const hasErrors = result.diagnostics.some((d) => d.severity === "error");
    return {
      path: themePath,
      env: hasErrors ? undefined : result.env,
      ast: result.ast,
      source,
      index: new LineIndex(source),
    };
  }

  /** Drops caches for a changed/created/deleted .arv file. */
  invalidate(file: string): void {
    this.themes.delete(path.resolve(file));
    // Creation/deletion can change which theme any directory resolves to.
    this.themeByDir.clear();
  }

  invalidateAll(): void {
    this.themes.clear();
    this.themeByDir.clear();
  }
}

export function workspaceRootFor(file: string): string {
  let dir = path.dirname(file);
  for (;;) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.dirname(file);
    dir = parent;
  }
}
