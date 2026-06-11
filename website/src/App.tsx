import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getTheme, setTheme } from "./arvia-theme";
import { SiteNav } from "./components/ui";
import { SiteThemeProvider } from "./site-theme";
import { HomePage } from "./pages/HomePage";
import { DocPage } from "./pages/DocPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";

export function App() {
  const [theme, setThemeState] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!getTheme()) setTheme("dark");
  }, []);

  function toggleTheme() {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <SiteThemeProvider theme={theme}>
      <SiteNav onThemeToggle={toggleTheme} themeLabel={theme === "dark" ? "Light" : "Dark"} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs/:slug" element={<DocPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
      </Routes>
    </SiteThemeProvider>
  );
}
