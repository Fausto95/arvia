import { FRAMEWORKS, type FrameworkId } from "./frameworks";

/** Placeholder the worker writes into transpiled app code wherever the
 *  `.arv` design module is imported; the iframe substitutes a blob URL. */
export const DESIGN_URL_PLACEHOLDER = "__ARVIA_DESIGN_URL__";

export interface PreviewUpdate {
  type: "update";
  css: string;
  designJs: string;
  appJs: string;
  /** Site theme mode — mirrored onto the iframe root via data-arvia-theme so
   *  the injected theme CSS resolves the same mode (the attribute flips
   *  color-scheme, which drives the light-dark() tokens). */
  theme: "light" | "dark";
}

export type PreviewMessage =
  | { type: "ready" }
  | { type: "ok" }
  | { type: "error"; message: string; stack?: string }
  | { type: "console"; level: "log" | "info" | "warn" | "error"; text: string };

/**
 * The preview document: import map + error/console bridge + module bootstrap.
 * Loaded with `sandbox="allow-scripts"` only — the origin is opaque, so user
 * code (including shared-link code) can never touch arvia.dev. That also means
 * blob URLs must be minted here, inside the iframe: the parent's blobs are
 * keyed to the parent origin and unreachable from an opaque origin.
 */
export function buildSrcdoc(framework: FrameworkId): string {
  const spec = FRAMEWORKS[framework];
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://esm.sh" crossorigin>
<script type="importmap">${JSON.stringify({ imports: spec.importMap })}</script>
<style>
  html, body { margin: 0; background: transparent; }
  body { font-family: system-ui, sans-serif; }
  #root { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 4px; }
</style>
<style id="arvia-css"></style>
<script>
  const send = (msg) => parent.postMessage(msg, "*");
  window.onerror = (message, _src, _line, _col, error) =>
    send({ type: "error", message: String(error && error.message || message), stack: error && error.stack });
  window.addEventListener("unhandledrejection", (e) =>
    send({ type: "error", message: String(e.reason && e.reason.message || e.reason) }));
  for (const level of ["log", "info", "warn", "error"]) {
    const original = console[level].bind(console);
    console[level] = (...args) => {
      original(...args);
      try {
        const text = args.map((a) => {
          if (typeof a === "string") return a;
          try { return JSON.stringify(a); } catch { return String(a); }
        }).join(" ");
        send({ type: "console", level, text });
      } catch {}
    };
  }
</script>
</head>
<body>
<div id="root"></div>
<script type="module">
${spec.mountScript}

const styleEl = document.getElementById("arvia-css");
let prevUrls = [];
const mintModule = (code) =>
  URL.createObjectURL(new Blob([code], { type: "text/javascript" }));

addEventListener("message", async (e) => {
  const msg = e.data;
  if (!msg || msg.type !== "update") return;
  try {
    document.documentElement.dataset.arviaTheme = msg.theme;
    styleEl.textContent = msg.css;
    const designUrl = mintModule(msg.designJs);
    const appUrl = mintModule(msg.appJs.replaceAll(${JSON.stringify(DESIGN_URL_PLACEHOLDER)}, designUrl));
    const mod = await import(appUrl);
    if (mod.default == null) throw new Error("App must have a default export");
    globalThis.__mount(mod.default);
    for (const url of prevUrls) URL.revokeObjectURL(url);
    prevUrls = [designUrl, appUrl];
    parent.postMessage({ type: "ok" }, "*");
  } catch (error) {
    parent.postMessage({
      type: "error",
      message: String(error && error.message || error),
      stack: error && error.stack,
    }, "*");
  }
});

parent.postMessage({ type: "ready" }, "*");
</script>
</body>
</html>`;
}
