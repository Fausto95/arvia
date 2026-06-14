import { compile, type CompileResult, type ThemeEnv } from "@arviahq/compiler";
import { transform } from "sucrase";
import { defaultAppSource } from "./app-snippets";
import type { BuildRequest, BuildResponse } from "./protocol";
import { DESIGN_URL_PLACEHOLDER } from "./srcdoc";

/** Snippet generation stays anchored to the last successful compile so the
 *  app file doesn't flip to the empty fallback while typing through errors. */
let lastGood: { meta: CompileResult["meta"]; css: string } = {
  meta: { components: [], tokens: [], keyframes: [], styles: [] },
  css: "",
};

/** Last successfully-compiled theme, so a transient error while editing
 *  theme.arv doesn't blank the env (and thus the whole preview). */
let lastGoodTheme: { env: ThemeEnv | undefined; css: string } = { env: undefined, css: "" };

/** Point `.arv` imports at the placeholder the iframe swaps for a blob URL. */
function rewriteArvImports(js: string): string {
  return js.replace(
    /(\bfrom\s*|\bimport\s*\(?\s*)(["'])([^"']*\.arv)\2/g,
    (_, lead: string, quote: string) => `${lead}${quote}${DESIGN_URL_PLACEHOLDER}${quote}`,
  );
}

function transpileTsx(source: string, jsxImportSource: "react" | "preact"): string {
  return transform(source, {
    transforms: ["typescript", "jsx"],
    jsxRuntime: "automatic",
    jsxImportSource,
    production: true,
  }).code;
}

type Sfc = typeof import("@vue/compiler-sfc");
let sfcPromise: Promise<Sfc> | null = null;

/** Same recipe as @vue/repl: compileScript with an inline template, sucrase
 *  TS-strip on the output, compileStyle per <style> block. */
async function transpileVue(source: string): Promise<{ js: string; css: string }> {
  const sfc = await (sfcPromise ??= import("@vue/compiler-sfc"));
  const { descriptor, errors } = sfc.parse(source, { filename: "App.vue" });
  if (errors.length > 0) throw errors[0];

  const id = "play";
  const scoped = descriptor.styles.some((s) => s.scoped);
  const scopeId = `data-v-${id}`;

  let js: string;
  if (descriptor.script || descriptor.scriptSetup) {
    const compiled = sfc.compileScript(descriptor, {
      id,
      inlineTemplate: descriptor.template != null,
      genDefaultAs: "__App",
    });
    const scopeTag = scoped ? `\n__App.__scopeId = ${JSON.stringify(scopeId)};` : "";
    js = `${compiled.content}${scopeTag}\nexport default __App;`;
  } else if (descriptor.template) {
    const template = sfc.compileTemplate({
      source: descriptor.template.content,
      filename: "App.vue",
      id,
      scoped,
    });
    if (template.errors.length > 0) throw template.errors[0];
    const scopeTag = scoped ? `, __scopeId: ${JSON.stringify(scopeId)}` : "";
    js = `${template.code}\nexport default { render${scopeTag} };`;
  } else {
    throw new Error("App.vue needs a <template> or <script> block");
  }

  js = transform(js, { transforms: ["typescript"], production: true }).code;

  let css = "";
  for (const style of descriptor.styles) {
    const compiled = sfc.compileStyle({
      source: style.content,
      filename: "App.vue",
      id: scopeId,
      scoped: style.scoped,
    });
    if (compiled.errors.length > 0) throw compiled.errors[0];
    css += `${compiled.code}\n`;
  }

  return { js, css };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Vue compiler errors carry a position; surface the line for the overlay.
    const loc = (error as { loc?: { start?: { line: number; column: number } } }).loc;
    return loc?.start
      ? `${error.message} (App.vue:${loc.start.line}:${loc.start.column})`
      : error.message;
  }
  return String(error);
}

self.onmessage = async (event: MessageEvent<BuildRequest>) => {
  const request = event.data;

  // Editable theme: compile theme.arv to derive the token env. Falls back to a
  // request-supplied env (the simple playground) when no themeSource is sent.
  let env = request.env;
  let themeCss = "";
  let themeDiagnostics: CompileResult["diagnostics"] = [];
  if (request.themeSource !== undefined) {
    const themeResult = compile(request.themeSource, { filename: "theme.arv" });
    themeDiagnostics = themeResult.diagnostics;
    if (!themeResult.diagnostics.some((d) => d.severity === "error")) {
      lastGoodTheme = { env: themeResult.env, css: themeResult.css ?? "" };
    }
    env = lastGoodTheme.env;
    themeCss = lastGoodTheme.css;
  }

  const result = compile(request.arvSource, { filename: "App.arv", env });
  if (result.css !== null) {
    lastGood = { meta: result.meta, css: result.css };
  }

  const appSource =
    request.appSource ??
    defaultAppSource(request.framework, lastGood.meta, lastGood.css, request.labels);

  let appJs: string | null = null;
  let appCss = "";
  let appError: string | null = null;
  try {
    if (request.framework === "vue") {
      const app = await transpileVue(appSource);
      appJs = rewriteArvImports(app.js);
      appCss = app.css;
    } else {
      appJs = rewriteArvImports(transpileTsx(appSource, request.framework));
    }
  } catch (error) {
    appError = errorMessage(error);
  }

  const response: BuildResponse = {
    id: request.id,
    css: result.css,
    dts: result.dts,
    designJs: result.js,
    meta: result.meta,
    diagnostics: result.diagnostics,
    appSource,
    appJs,
    appCss,
    appError,
    themeCss,
    themeDiagnostics,
  };
  self.postMessage(response);
};
