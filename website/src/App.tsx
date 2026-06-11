import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { setTheme } from "./arvia-theme";
import { DocsSearchProvider } from "./components/DocsSearch";
import { SiteNav } from "./components/ui";
import { SiteThemeProvider } from "./site-theme";
import { HomePage } from "./pages/HomePage";
import { DocPage } from "./pages/DocPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { getStoredTheme, setStoredTheme, type SiteLocale, type SiteTheme } from "./preferences";

export function App(props: { locale: SiteLocale; onLocaleChange: (locale: SiteLocale) => void }) {
  const [theme, setThemeState] = useState<SiteTheme>(() => getStoredTheme() ?? "dark");

  useEffect(() => {
    setTheme(theme);
    setStoredTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <SiteThemeProvider theme={theme}>
      <DocsSearchProvider>
        <SiteNav
          locale={props.locale}
          onLocaleChange={props.onLocaleChange}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs/:slug" element={<DocPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
        </Routes>
      </DocsSearchProvider>
    </SiteThemeProvider>
  );
}
