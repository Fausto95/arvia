import { useEffect, useState } from "react";
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
      {props.label && props.variant !== "flat" ? (
        <div className={block.header}>{props.label}</div>
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
