const THEME_ATTR = "data-arvia-theme";

/** Sets the active Arvia theme mode on `<html>`, overriding the OS color scheme. */
export function setTheme(mode: string): void {
  document.documentElement.setAttribute(THEME_ATTR, mode);
}

/** Returns the active Arvia theme mode from `<html>`, or null when unset. */
export function getTheme(): string | null {
  return document.documentElement.getAttribute(THEME_ATTR);
}
