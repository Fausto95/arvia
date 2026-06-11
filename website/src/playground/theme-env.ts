import { compile, type ThemeEnv } from "@arviahq/compiler";
import themeSource from "../theme.arv?raw";

let cachedEnv: ThemeEnv | null = null;

/** Compile the site theme once so playground sources can reference its tokens. */
export function getThemeEnv(): ThemeEnv {
  if (!cachedEnv) {
    cachedEnv = compile(themeSource, { filename: "theme.arv" }).env;
  }
  return cachedEnv;
}
