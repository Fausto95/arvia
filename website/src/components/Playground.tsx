import { useEffect, useMemo, useRef, useState } from "react";
import { compile, type CompileResult } from "@arviahq/compiler";
import { CodeBlock } from "./code-block.arv";
import { Playground as PlaygroundStyles } from "./playground.arv";
import { highlightCode } from "./highlight";
import { useSiteTheme } from "../site-theme";

const DEFAULT_SOURCE = `theme {
  color {
    primary = #6358ff;
    primaryHover = #5249e6;
  }
  radius { md = 10px; }
}

component Button {
  slots { root {} icon {} }

  base {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    padding: 10px 18px;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font-weight: 600;
    transition: all 150ms ease;

    &:hover {
      background: color.primaryHover;
      icon { transform: translateX(3px); }
    }
  }

  variants {
    size {
      sm { font-size: 13px; }
      lg { font-size: 17px; padding: 14px 24px; }
    }
  }

  defaults { size: sm; }
}
`;

type OutputTab = "preview" | "tsx" | "css" | "types";

interface LastGood {
  css: string;
  dts: string;
  meta: CompileResult["meta"];
}

export function Playground() {
  const pg = PlaygroundStyles();
  const editorBlock = CodeBlock();
  const outputBlock = CodeBlock();
  const siteTheme = useSiteTheme();

  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [tab, setTab] = useState<OutputTab>("preview");
  const [editorHtml, setEditorHtml] = useState<string | null>(null);
  const [outputHtml, setOutputHtml] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Compile in the browser on every edit — the same compiler that runs in Vite.
  const result = useMemo(() => compile(source, { filename: "playground.arv" }), [source]);
  const lastGood = useRef<LastGood>({ css: "", dts: "", meta: { ...emptyMeta } });
  if (result.css !== null) {
    lastGood.current = { css: result.css, dts: result.dts ?? "", meta: result.meta };
  }
  const { css, dts, meta } = lastGood.current;
  const errors = result.diagnostics.filter((d) => d.severity === "error");

  useEffect(() => {
    let cancelled = false;
    highlightCode(source, "css", siteTheme)
      .then((html) => {
        if (!cancelled) setEditorHtml(html);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [source, siteTheme]);

  const tsx = useMemo(() => usageSnippet(meta), [meta]);

  useEffect(() => {
    if (tab === "preview") return;
    const code = tab === "css" ? css : tab === "types" ? dts : tsx;
    let cancelled = false;
    highlightCode(code || "/* empty */", tab === "css" ? "css" : "tsx", siteTheme)
      .then((html) => {
        if (!cancelled) setOutputHtml(html);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [tab, css, dts, tsx, siteTheme]);

  const syncScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    const highlight = highlightRef.current?.querySelector("pre");
    if (highlight) {
      highlight.scrollTop = target.scrollTop;
      highlight.scrollLeft = target.scrollLeft;
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const target = event.currentTarget;
    const { selectionStart, selectionEnd, value } = target;
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    setSource(next);
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = selectionStart + 2;
    });
  };

  const dotsOf = (block: ReturnType<typeof CodeBlock>) => (
    <span className={block.dots} aria-hidden>
      <span className={block.dotRed} />
      <span className={block.dotAmber} />
      <span className={block.dotGreen} />
    </span>
  );

  return (
    <div className={pg.root}>
      <div className={editorBlock.root} style={{ margin: 0 }}>
        <div className={editorBlock.header}>
          {dotsOf(editorBlock)}
          playground.arv
          <span style={{ marginLeft: "auto", fontWeight: 500 }}>editable</span>
        </div>
        <div className={editorBlock.body} style={{ overflow: "hidden" }}>
          <div className={pg.editor}>
            <div ref={highlightRef} aria-hidden>
              {editorHtml ? (
                <div dangerouslySetInnerHTML={{ __html: editorHtml }} />
              ) : (
                <pre>{source}</pre>
              )}
            </div>
            <textarea
              className={pg.input}
              value={source}
              onChange={(event) => setSource(event.target.value)}
              onScroll={syncScroll}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-label="Arvia playground editor"
            />
          </div>
        </div>
        {errors.length > 0 ? (
          <ul className={pg.diagnostics}>
            {errors.slice(0, 3).map((d, i) => (
              <li key={i}>
                {d.line}:{d.col} {d.code} — {d.message}
                {d.hint ? ` (${d.hint})` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={outputBlock.root} style={{ margin: 0 }}>
        <div className={outputBlock.header}>
          {dotsOf(outputBlock)}
          output
          <span className={pg.tabs}>
            {(["preview", "tsx", "css", "types"] as const).map((name) => (
              <button
                key={name}
                type="button"
                className={pg.tab}
                data-active={tab === name}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </span>
        </div>
        {tab === "preview" ? (
          <div className={pg.preview}>
            <style>{css}</style>
            <LivePreview meta={meta} />
          </div>
        ) : (
          <div className={outputBlock.body} style={{ margin: 0 }}>
            <div className={pg.output}>
              {outputHtml ? (
                <div dangerouslySetInnerHTML={{ __html: outputHtml }} />
              ) : (
                <pre style={{ margin: 0, padding: 16 }}>
                  {tab === "css" ? css : tab === "types" ? dts : tsx}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** How you'd consume the compiled component from React. */
function usageSnippet(meta: CompileResult["meta"]): string {
  const component = meta.components[0];
  if (!component) {
    const style = meta.styles[0];
    if (!style) return "// define a component or style to see its usage";
    return `import { ${style.name} } from "./playground.arv";

<p className={${style.name}}>Hello</p>;
`;
  }

  const variant = component.variants[0];
  const props =
    variant && variant.values.length > 0
      ? `{ ${variant.name}: "${variant.values[variant.values.length - 1]}" }`
      : "";
  const icon = component.slots.includes("icon") ? `\n  <span className={styles.icon}>→</span>` : "";

  return `import { ${component.name} } from "./playground.arv";

const styles = ${component.name}(${props});

<button className={styles.root}>
  Click me${icon}
</button>;
`;
}

const emptyMeta: CompileResult["meta"] = {
  components: [],
  tokens: [],
  keyframes: [],
  styles: [],
};

/** Renders the first compiled component once per value of its first variant. */
function LivePreview({ meta }: { meta: CompileResult["meta"] }) {
  const component = meta.components[0];
  if (!component) {
    return <span style={{ opacity: 0.6, fontSize: 13 }}>define a component to preview it</span>;
  }

  const classFor = (overrides: Record<string, string>): string => {
    const classes = [`${component.name}_root_${component.hash}`];
    for (const variant of component.variants) {
      const value = overrides[variant.name] ?? component.defaults[variant.name];
      if (value) {
        classes.push(`${component.name}_${variant.name}_${value}_root_${component.hash}`);
      }
    }
    return classes.join(" ");
  };

  const hasIcon = component.slots.includes("icon");
  const renderOne = (label: string, overrides: Record<string, string>) => (
    <button key={label} type="button" className={classFor(overrides)}>
      {label}
      {hasIcon ? (
        <span className={`${component.name}_icon_${component.hash}`} aria-hidden>
          →
        </span>
      ) : null}
    </button>
  );

  const firstVariant = component.variants[0];
  if (!firstVariant || firstVariant.values.length === 0) {
    return renderOne(component.name, {});
  }
  return (
    <>{firstVariant.values.map((value) => renderOne(value, { [firstVariant.name]: value }))}</>
  );
}
