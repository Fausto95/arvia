import { useEffect, useRef, useState } from "react";
import { Button } from "./button.arv";
import { CodeBlock } from "./code-block.arv";
import { highlightCode, langFromLabel } from "./highlight";
import { useSiteTheme } from "../site-theme";

export function Code(props: {
  label?: string;
  lang?: string;
  variant?: "default" | "flat";
  children: string;
}) {
  const block = CodeBlock({ variant: props.variant === "flat" ? "flat" : "default" });
  const siteTheme = useSiteTheme();
  const lang = props.lang ?? langFromLabel(props.label, props.children);
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(props.children);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — leave button in idle state.
    }
  }

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    highlightCode(props.children, lang, siteTheme)
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [props.children, lang, siteTheme]);

  return (
    <div className={block.root}>
      {props.variant !== "flat" ? (
        <div className={block.header}>
          <span className={block.dots} aria-hidden>
            <span className={block.dotRed} />
            <span className={block.dotAmber} />
            <span className={block.dotGreen} />
          </span>
          {props.label}
          <div className={block.actions}>
            <button
              type="button"
              className={Button({ tone: "ghost", size: "sm" }).root}
              aria-label={copied ? "Copied" : "Copy code"}
              aria-live="polite"
              onClick={copyCode}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}
      <div className={block.body}>
        {html ? (
          <div className={block.scroll} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre style={{ margin: 0, padding: 16, overflowX: "auto" }}>
            <code>{props.children}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
