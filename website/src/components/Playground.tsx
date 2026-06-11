import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { compile, LineIndex, type CompileResult, type ThemeEnv } from "@arviahq/compiler";
import { CodeBlock } from "./code-block.arv";
import { Playground as PlaygroundStyles } from "./playground.arv";
import { highlightCode } from "./highlight";
import { useSiteTheme } from "../site-theme";
import type { ArviaMarker } from "./MonacoArvia";

// Monaco is heavy — load it only when the playground renders.
const MonacoArvia = lazy(() => import("./MonacoArvia"));

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

type OutputTab = "preview" | "css" | "types";
type EditorFile = "arv" | "tsx";

export interface PlaygroundTemplate {
  id: string;
  label: string;
  source: string;
}

export interface PlaygroundTemplateGroup {
  label: string;
  items: PlaygroundTemplate[];
}

interface LastGood {
  css: string;
  dts: string;
  meta: CompileResult["meta"];
}

export function Playground(props: {
  /** Pane height in px — editor, output, and preview all match. */
  height?: number;
  /** Theme environment so sources can reference site tokens (color.*, space.*…). */
  env?: ThemeEnv;
  /** When set, a template select replaces the "editable" header label. */
  templates?: PlaygroundTemplateGroup[];
} = {}) {
  const pg = PlaygroundStyles();
  const editorBlock = CodeBlock();
  const outputBlock = CodeBlock();
  const siteTheme = useSiteTheme();
  const height = props.height ?? 300;

  const firstTemplate = props.templates?.[0]?.items[0];
  const [source, setSource] = useState(firstTemplate?.source ?? DEFAULT_SOURCE);
  const [templateId, setTemplateId] = useState(firstTemplate?.id ?? "");
  const [file, setFile] = useState<EditorFile>("arv");
  const [editedTsx, setEditedTsx] = useState<string | null>(null);
  const [tab, setTab] = useState<OutputTab>("preview");
  const [outputHtml, setOutputHtml] = useState<string | null>(null);

  function selectTemplate(id: string) {
    const template = (props.templates ?? []).flatMap((g) => g.items).find((t) => t.id === id);
    if (!template) return;
    setTemplateId(id);
    setSource(template.source);
    setEditedTsx(null);
    setFile("arv");
  }

  // Compile in the browser on every edit — the same compiler that runs in Vite.
  const result = useMemo(
    () => compile(source, { filename: "playground.arv", env: props.env }),
    [source, props.env],
  );
  const lastGood = useRef<LastGood>({ css: "", dts: "", meta: { ...emptyMeta } });
  if (result.css !== null) {
    lastGood.current = { css: result.css, dts: result.dts ?? "", meta: result.meta };
  }
  const { css, dts, meta } = lastGood.current;
  const errors = result.diagnostics.filter((d) => d.severity === "error");

  // App.tsx follows the compiled component until the user edits it by hand.
  const tsx = editedTsx ?? usageSnippet(meta, css);

  useEffect(() => {
    if (tab === "preview") return;
    const code = tab === "css" ? css : dts;
    let cancelled = false;
    highlightCode(code || "/* empty */", tab === "css" ? "css" : "tsx", siteTheme)
      .then((html) => {
        if (!cancelled) setOutputHtml(html);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [tab, css, dts, siteTheme]);

  // Compiler diagnostics become real editor squiggles.
  const markers = useMemo<ArviaMarker[]>(() => {
    const index = new LineIndex(source);
    return errors.map((d) => {
      const range = index.spanToRange(d.span);
      return {
        startLineNumber: range.start.line,
        startColumn: range.start.col,
        endLineNumber: range.end.line,
        endColumn: range.end.col,
        message: d.hint ? `${d.message} (${d.hint})` : d.message,
      };
    });
  }, [source, errors]);

  useEffect(() => {
    let cancelled = false;
    import("./MonacoArvia").then((mod) => {
      if (!cancelled) mod.setMarkersOnCurrentModels(markers);
    });
    return () => {
      cancelled = true;
    };
  }, [markers]);

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
          <span className={pg.tabs} style={{ marginLeft: 0 }}>
            {(
              [
                ["arv", "playground.arv"],
                ["tsx", "App.tsx"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={pg.tab}
                data-active={file === id}
                onClick={() => setFile(id)}
              >
                {label}
              </button>
            ))}
          </span>
          {props.templates ? (
            <select
              value={templateId}
              onChange={(e) => selectTemplate(e.target.value)}
              style={{
                marginLeft: "auto",
                padding: "2px 8px",
                borderRadius: 6,
                border: "1px solid var(--arvia-color-border)",
                background: "var(--arvia-color-surface)",
                color: "var(--arvia-color-text)",
                fontFamily: "inherit",
                fontSize: 12,
              }}
            >
              {props.templates.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <span style={{ marginLeft: "auto", fontWeight: 500 }}>editable</span>
          )}
        </div>
        <div className={editorBlock.body} style={{ overflow: "hidden" }}>
          <div className={pg.editor} style={{ height }}>
            <Suspense
              fallback={
                <pre style={{ margin: 0, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
                  {file === "arv" ? source : tsx}
                </pre>
              }
            >
              <MonacoArvia
                path={file === "arv" ? "playground.arv" : "App.tsx"}
                language={file === "arv" ? "arvia" : "typescript"}
                value={file === "arv" ? source : tsx}
                onChange={file === "arv" ? setSource : setEditedTsx}
                theme={siteTheme}
                markers={markers}
                height={height}
              />
            </Suspense>
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
            {(["preview", "css", "types"] as const).map((name) => (
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
          <div className={pg.preview} style={{ height }}>
            <style>{css}</style>
            <LivePreview meta={meta} tsx={tsx} css={css} />
          </div>
        ) : (
          <div className={outputBlock.body} style={{ margin: 0 }}>
            <div className={pg.output} style={{ height }}>
              {outputHtml ? (
                <div dangerouslySetInnerHTML={{ __html: outputHtml }} />
              ) : (
                <pre style={{ margin: 0, padding: 16 }}>{tab === "css" ? css : dts}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Interactive-looking components preview as a button, everything else as a div. */
function previewTagFor(css: string): "button" | "div" {
  return /cursor:\s*pointer/.test(css) ? "button" : "div";
}

function slotSampleText(slot: string, label: string): string {
  if (slot === "icon") return "→";
  if (slot === "label") return label;
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function childTagFor(slot: string): string {
  return slot === "icon" || slot === "label" ? "span" : "div";
}

/** How you'd consume the compiled component from React. */
function usageSnippet(meta: CompileResult["meta"], css: string): string {
  const component = meta.components[0];
  if (!component) {
    const style = meta.styles[0];
    if (!style) return "// define a component or style to see its usage";
    return `import { ${style.name} } from "./playground.arv";

<p className={${style.name}}>The quick brown fox jumps over the lazy dog</p>;
`;
  }

  const variant = component.variants[0];
  const props =
    variant && variant.values.length > 0
      ? `{ ${variant.name}: "${variant.values[variant.values.length - 1]}" }`
      : "";

  const tag = previewTagFor(css);
  const childSlots = component.slots.filter((s) => s !== "root");
  const rootText = childSlots.some((s) => s !== "icon") ? "" : "\n  Click me";
  const children = childSlots
    .map((slot) => {
      const t = childTagFor(slot);
      return `\n  <${t} className={styles.${slot}}>${slotSampleText(slot, "Click me")}</${t}>`;
    })
    .join("");

  return `import { ${component.name} } from "./playground.arv";

const styles = ${component.name}(${props});

<${tag} className={styles.root}>${rootText}${children}
</${tag}>;
`;
}

const emptyMeta: CompileResult["meta"] = {
  components: [],
  tokens: [],
  keyframes: [],
  styles: [],
};

interface TsxUsage {
  props: Record<string, string>;
  tag: string;
  rootText: string;
  children: { slot: string; tag: string; text: string }[];
}

/** Best-effort read of the App.tsx usage: variant props, element tag, slot children. */
function parseUsage(tsx: string, componentName: string): TsxUsage | null {
  const call = tsx.match(new RegExp(`\\b${componentName}\\s*\\(([^)]*)\\)`));
  if (!call) return null;

  const props: Record<string, string> = {};
  for (const m of (call[1] ?? "").matchAll(/([A-Za-z_$][\w$]*)\s*:\s*["']([^"']*)["']/g)) {
    props[m[1] ?? ""] = m[2] ?? "";
  }

  // Greedy body match: the root may contain children of the same tag (div in div),
  // so capture through to the LAST matching close tag.
  const root =
    tsx.match(/<([a-zA-Z][\w]*)\s[^>]*className=\{styles\.root\}[^>]*>([\s\S]*)<\/\1>/) ??
    tsx.match(/<([a-zA-Z][\w]*)\b[^>]*>([\s\S]*)<\/\1>/);
  const tag = root?.[1] ?? "div";
  const inner = root?.[2] ?? "";

  const children: TsxUsage["children"] = [];
  for (const m of inner.matchAll(/<(\w+)\s[^>]*className=\{styles\.(\w+)\}[^>]*>([^<]*)<\/\1>/g)) {
    children.push({ tag: m[1] ?? "span", slot: m[2] ?? "", text: (m[3] ?? "").trim() });
  }

  const rootText = inner
    .replace(/<(\w+)[^>]*>[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]*\/>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .trim();

  return { props, tag, rootText, children };
}

/** Renders what App.tsx describes; falls back to one instance per first-variant value. */
function LivePreview({
  meta,
  tsx,
  css,
}: {
  meta: CompileResult["meta"];
  tsx: string;
  css: string;
}) {
  const component = meta.components[0];
  if (!component) {
    const style = meta.styles[0];
    if (style) {
      const text = tsx.match(/>([^<{]+)</)?.[1]?.trim();
      return (
        <p className={style.className} style={{ margin: 0 }}>
          {text || "The quick brown fox jumps over the lazy dog"}
        </p>
      );
    }
    return (
      <span style={{ opacity: 0.6, fontSize: 13 }}>define a component or style to preview it</span>
    );
  }

  const classFor = (slot: string, overrides: Record<string, string>): string => {
    const classes = [`${component.name}_${slot}_${component.hash}`];
    for (const variant of component.variants) {
      const override = overrides[variant.name];
      const value =
        override && variant.values.includes(override)
          ? override
          : component.defaults[variant.name];
      if (value) {
        classes.push(`${component.name}_${variant.name}_${value}_${slot}_${component.hash}`);
      }
    }
    return classes.join(" ");
  };

  // contain: inline-size (container queries) zeroes the root's intrinsic width,
  // so those components need an explicit stage to render at a visible size.
  const needsWidthStage = /container-type/.test(css);

  const renderInstance = (
    key: string,
    overrides: Record<string, string>,
    tag: string,
    rootText: string,
    children: TsxUsage["children"],
  ) => {
    const Root = (/^[a-z][a-z0-9]*$/.test(tag) ? tag : "div") as ElementType;
    return (
      <Root
        key={key}
        type={tag === "button" ? "button" : undefined}
        className={classFor("root", overrides)}
        style={needsWidthStage ? { width: "min(420px, 100%)" } : undefined}
      >
        {rootText || null}
        {children.map((child, i) => {
          const Child = (/^[a-z][a-z0-9]*$/.test(child.tag) ? child.tag : "span") as ElementType;
          return (
            <Child
              key={`${child.slot}-${i}`}
              className={
                component.slots.includes(child.slot) ? classFor(child.slot, overrides) : undefined
              }
            >
              {child.text}
            </Child>
          );
        })}
      </Root>
    );
  };

  const defaultTag = previewTagFor(css);
  const defaultChildren = (label: string): TsxUsage["children"] =>
    component.slots
      .filter((s) => s !== "root")
      .map((slot) => ({ slot, tag: childTagFor(slot), text: slotSampleText(slot, label) }));
  const defaultRootText = (label: string) =>
    component.slots.some((s) => s !== "root" && s !== "icon") ? "" : label;

  const usage = parseUsage(tsx, component.name);
  if (usage) {
    return renderInstance("usage", usage.props, usage.tag, usage.rootText, usage.children);
  }

  const firstVariant = component.variants[0];
  if (!firstVariant || firstVariant.values.length === 0) {
    return renderInstance(
      component.name,
      {},
      defaultTag,
      defaultRootText(component.name),
      defaultChildren(component.name),
    );
  }
  return (
    <>
      {firstVariant.values.map((value) =>
        renderInstance(
          value,
          { [firstVariant.name]: value },
          defaultTag,
          defaultRootText(value),
          defaultChildren(value),
        ),
      )}
    </>
  );
}
