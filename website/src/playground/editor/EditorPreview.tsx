import type { CompileResult } from "@arviahq/compiler";
import { useEffect, useState, type ReactNode } from "react";
import { Text } from "../../components/text.arv";

type PreviewModule = Record<string, (...args: unknown[]) => Record<string, string>>;

export function EditorPreview(props: {
  result: CompileResult | null;
  themeCss: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReactNode>(null);

  useEffect(() => {
    let styleEl: HTMLStyleElement | null = null;
    let blobUrl: string | null = null;
    let cancelled = false;

    async function run() {
      setError(null);
      setPreview(null);

      if (!props.result?.css || !props.result.js) {
        if (props.result?.diagnostics.some((d) => d.severity === "error")) {
          setError("Fix compile errors to see preview.");
        }
        return;
      }

      const component = props.result.meta.components[0];
      if (!component) {
        setError("No component found — add a component block to preview.");
        return;
      }

      try {
        styleEl = document.createElement("style");
        styleEl.setAttribute("data-playground-preview", "");
        styleEl.textContent = `${props.themeCss}\n${props.result.css}`;
        document.head.appendChild(styleEl);

        const blob = new Blob([props.result.js], { type: "text/javascript" });
        blobUrl = URL.createObjectURL(blob);
        const mod = (await import(/* @vite-ignore */ blobUrl)) as PreviewModule;
        const fn = mod[component.name];
        if (!fn) {
          setError(`Export ${component.name} not found in compiled JS.`);
          return;
        }

        const classes = fn();
        if (cancelled) return;

        const slots = component.slots;
        if (slots.includes("icon") && slots.includes("label")) {
          setPreview(
            <button type="button" className={classes.root}>
              <span className={classes.icon}>★</span>
              <span className={classes.label}>Preview</span>
            </button>,
          );
        } else if (slots.length === 1 && slots[0] === "root") {
          setPreview(
            <div className={classes.root} style={{ display: "inline-flex" }}>
              {component.name} preview
            </div>,
          );
        } else {
          setPreview(
            <div className={classes.root ?? Object.values(classes)[0]}>
              {component.name} preview
            </div>,
          );
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load preview.");
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (styleEl?.parentNode) styleEl.parentNode.removeChild(styleEl);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [props.result, props.themeCss]);

  return (
    <div data-playground-preview style={{ minHeight: 120, padding: 24 }}>
      {error ? (
        <p className={Text({ size: "sm", tone: "muted" }).root}>{error}</p>
      ) : preview ? (
        preview
      ) : (
        <p className={Text({ size: "sm", tone: "muted" }).root}>Compiling…</p>
      )}
    </div>
  );
}
