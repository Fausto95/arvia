import { analyze, LineIndex, type ArviaFile, type ThemeEnv } from "@arviahq/compiler";

/** A loaded shared theme. */
export interface ThemeInfo {
  path: string;
  /** undefined when the theme itself has errors. */
  env: ThemeEnv | undefined;
  ast: ArviaFile;
  source: string;
  index: LineIndex;
}

/**
 * The slice of workspace knowledge the cross-file features need. The node
 * server implements it with filesystem theme resolution (WorkspaceState);
 * browser embedders provide a single in-memory theme or none at all.
 */
export interface ThemeHost {
  themeFor(file: string): ThemeInfo | null;
}

export const nullThemeHost: ThemeHost = { themeFor: () => null };

/** Host serving one in-memory theme to every document (playgrounds). */
export function themeHostFor(source: string, path = "theme.arv"): ThemeHost {
  const result = analyze(source, { filename: path, sharedEnvFile: true });
  const hasErrors = result.diagnostics.some((d) => d.severity === "error");
  const info: ThemeInfo = {
    path,
    env: hasErrors ? undefined : result.env,
    ast: result.ast,
    source,
    index: new LineIndex(source),
  };
  return { themeFor: (file) => (file === path ? null : info) };
}
