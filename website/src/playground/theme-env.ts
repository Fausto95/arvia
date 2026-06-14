import { compile, type ThemeEnv } from "@arviahq/compiler";
import themeSource from "../theme.arv?raw";

/** The site theme source, used to seed the editable `theme.arv` file in the
 *  full playground IDE. */
export const defaultThemeSource = themeSource;

let cached: { env: ThemeEnv; css: string } | null = null;

/** Compile the site theme once so playground sources can reference its tokens. */
function bootstrap() {
  if (!cached) {
    const result = compile(themeSource, { filename: "theme.arv" });
    cached = { env: result.env, css: result.css ?? "" };
  }
  return cached;
}

export function getThemeEnv(): ThemeEnv {
  return bootstrap().env;
}

/**
 * The theme CSS from the same in-browser compile as the env. The preview must
 * inject this rather than rely on the site's global CSS: hashed names (e.g.
 * @keyframes pulse_<hash>) differ between the Vite build and this compile.
 */
export function getThemeCss(): string {
  return bootstrap().css;
}
