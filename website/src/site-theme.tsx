import { createContext, useContext, type ReactNode } from "react";

export type SiteTheme = "light" | "dark";

const SiteThemeContext = createContext<SiteTheme>("dark");

export function SiteThemeProvider(props: { theme: SiteTheme; children: ReactNode }) {
  return (
    <SiteThemeContext.Provider value={props.theme}>{props.children}</SiteThemeContext.Provider>
  );
}

export function useSiteTheme(): SiteTheme {
  return useContext(SiteThemeContext);
}
