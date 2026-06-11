import { compile, type CompileResult, type ThemeEnv } from "@arviahq/compiler";
import { useEffect, useMemo, useState } from "react";
import themeSource from "../../theme.arv?raw";

let cachedThemeEnv: ThemeEnv | null = null;
let cachedThemeCss: string | null = null;

function getThemeBootstrap() {
  if (!cachedThemeEnv || !cachedThemeCss) {
    const result = compile(themeSource, { filename: "theme.arv" });
    cachedThemeEnv = result.env;
    cachedThemeCss = result.css ?? "";
  }
  return { env: cachedThemeEnv, css: cachedThemeCss };
}

export function useArviaCompiler(source: string, filename = "playground.arv") {
  const [result, setResult] = useState<CompileResult | null>(null);
  const theme = useMemo(() => getThemeBootstrap(), []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const compiled = compile(source, { filename, env: theme.env });
      setResult(compiled);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [source, filename, theme.env]);

  return {
    result,
    themeCss: theme.css,
  };
}
