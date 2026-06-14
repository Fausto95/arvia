import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { LineIndex, type CompileResult, type ThemeEnv } from "@arviahq/compiler";
import { headingText } from "../lib/render-prose";
import { CodeBlock } from "./code-block.arv";
import { Ide, Playground as PlaygroundStyles } from "./playground.arv";
import { tokens } from "../theme.arv";
import { highlightCode } from "./highlight";
import { useSiteTheme } from "../site-theme";
import type { ArviaMarker } from "./MonacoArvia";
import { DEFAULT_SOURCE, type PlaygroundTemplateGroup } from "./Playground";
import { FRAMEWORKS, type FrameworkId } from "../playground/runtime/frameworks";
import { PreviewFrame } from "../playground/runtime/PreviewFrame";
import { BuildClient, type BuildResponse } from "../playground/runtime/worker-client";
import { encodeShared } from "../playground/share";
import { defaultThemeSource } from "../playground/theme-env";

// Monaco is heavy — load it only when the playground renders.
const MonacoArvia = lazy(() => import("./MonacoArvia"));

type FileId = "arv" | "app" | "theme" | "css" | "dts";

interface LastGood {
  css: string;
  dts: string;
  meta: CompileResult["meta"];
}

interface PreviewPayload {
  css: string;
  designJs: string;
  appJs: string;
}

const emptyMeta: CompileResult["meta"] = {
  components: [],
  tokens: [],
  keyframes: [],
  styles: [],
};

/** Width of the draggable gutters between panes. */
const HANDLE_PX = 5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Full-page playground: files sidebar, editor, and a browser-styled live
 *  preview that really executes the app (React/Preact/Vue). */
export function PlaygroundIDE(props: {
  env?: ThemeEnv;
  baseCss?: string;
  templates?: PlaygroundTemplateGroup[];
  initialSource?: string;
  initialFramework?: FrameworkId;
  initialApp?: string;
  initialTheme?: string;
}) {
  const ide = Ide();
  const pg = PlaygroundStyles();
  const chrome = CodeBlock();
  const siteTheme = useSiteTheme();

  const clickMe = headingText(<fbt desc="Playground preview button label">{"Click me"}</fbt>);
  const sampleText = headingText(
    <fbt desc="Playground preview placeholder text">
      {"The quick brown fox jumps over the lazy dog"}
    </fbt>,
  );
  const emptyPreviewHint = headingText(
    <fbt desc="Playground empty preview hint">{"define a component or style to preview it"}</fbt>,
  );

  const firstTemplate = props.templates?.[0]?.items[0];
  const [source, setSource] = useState(
    props.initialSource ?? firstTemplate?.source ?? DEFAULT_SOURCE,
  );
  const [templateId, setTemplateId] = useState(
    props.initialSource ? "" : (firstTemplate?.id ?? ""),
  );
  const [file, setFile] = useState<FileId>("arv");
  const [themeSource, setThemeSource] = useState(props.initialTheme ?? defaultThemeSource);
  const [framework, setFramework] = useState<FrameworkId>(props.initialFramework ?? "react");
  const [editedApp, setEditedApp] = useState<Partial<Record<FrameworkId, string>>>(() =>
    props.initialApp ? { [props.initialFramework ?? "react"]: props.initialApp } : {},
  );
  const [build, setBuild] = useState<BuildResponse | null>(null);
  const [outputHtml, setOutputHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  // Resizable panes: sidebar width in px, editor/preview split as a fraction.
  const rootRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(192);
  const [split, setSplit] = useState(0.5);
  const [dragging, setDragging] = useState<"sidebar" | "split" | null>(null);

  function resizerProps(which: "sidebar" | "split") {
    return {
      className: ide.resizer,
      role: "separator",
      "aria-orientation": "vertical" as const,
      "data-dragging": dragging === which,
      onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        try {
          // Best effort: capture keeps moves flowing while over the iframe.
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Synthetic pointers can't be captured — window listeners still work.
        }
        setDragging(which);
      },
    };
  }

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      if (dragging === "sidebar") {
        setSidebarWidth(clamp(x, 140, Math.max(200, rect.width * 0.4)));
      } else {
        const avail = rect.width - sidebarWidth - 2 * HANDLE_PX;
        setSplit(clamp((x - sidebarWidth - HANDLE_PX) / avail, 0.2, 0.8));
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, sidebarWidth]);

  function selectTemplate(id: string) {
    const template = (props.templates ?? []).flatMap((g) => g.items).find((t) => t.id === id);
    if (!template) return;
    setTemplateId(id);
    setSource(template.source);
    setEditedApp({});
    setFile("arv");
  }

  function share() {
    const hash = encodeShared({ source, framework, app: editedApp[framework] ?? null });
    history.replaceState(null, "", hash);
    navigator.clipboard
      .writeText(`${location.origin}/playground${hash}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => undefined);
  }

  // Compilation runs in a worker — the same compiler that runs in Vite, plus
  // the app-file transpile for the live preview. The editor thread stays free.
  const clientRef = useRef<BuildClient | null>(null);
  useEffect(() => {
    const client = new BuildClient(setBuild);
    clientRef.current = client;
    return () => {
      client.dispose();
      clientRef.current = null;
    };
  }, []);

  const appSource = editedApp[framework] ?? null;
  useEffect(() => {
    clientRef.current?.request({
      framework,
      arvSource: source,
      appSource,
      labels: { clickMe, sampleText },
      themeSource,
    });
  }, [framework, source, appSource, themeSource, clickMe, sampleText]);

  const lastGood = useRef<LastGood>({ css: "", dts: "", meta: { ...emptyMeta } });
  if (build && build.css !== null) {
    lastGood.current = { css: build.css, dts: build.dts ?? "", meta: build.meta };
  }
  const { css, dts, meta } = lastGood.current;
  const errors = (build?.diagnostics ?? []).filter((d) => d.severity === "error");
  const themeErrors = (build?.themeDiagnostics ?? []).filter((d) => d.severity === "error");
  // Errors for whichever .arv file is in the editor — drives squiggles and the
  // diagnostics list (theme.arv errors reference the theme source, not App.arv).
  const activeArvaSource = file === "theme" ? themeSource : source;
  const activeArvaErrors = file === "theme" ? themeErrors : errors;

  const lastPreview = useRef<PreviewPayload | null>(null);
  if (build && build.css !== null && build.designJs !== null && build.appJs !== null) {
    lastPreview.current = {
      // Theme CSS comes from the live theme.arv compile (worker); fall back to
      // the static baseCss prop when the theme isn't being edited.
      css: `${build.themeCss || props.baseCss || ""}\n${build.css}\n${build.appCss}`,
      designJs: build.designJs,
      appJs: build.appJs,
    };
  }

  // The app file follows the compiled component until the user edits it by hand.
  const app = editedApp[framework] ?? build?.appSource ?? "";
  const appFileName = FRAMEWORKS[framework].appFileName;

  useEffect(() => {
    if (file !== "css" && file !== "dts") return;
    const code = file === "css" ? css : dts;
    let cancelled = false;
    highlightCode(code || "/* empty */", file === "css" ? "css" : "tsx", siteTheme)
      .then((html) => {
        if (!cancelled) setOutputHtml(html);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [file, css, dts, siteTheme]);

  // Compiler diagnostics become real editor squiggles for the active .arv file.
  const markers = useMemo<ArviaMarker[]>(() => {
    const index = new LineIndex(activeArvaSource);
    return activeArvaErrors.map((d) => {
      const range = index.spanToRange(d.span);
      return {
        startLineNumber: range.start.line,
        startColumn: range.start.col,
        endLineNumber: range.end.line,
        endColumn: range.end.col,
        message: d.hint ? `${d.message} (${d.hint})` : d.message,
      };
    });
  }, [activeArvaSource, activeArvaErrors]);

  useEffect(() => {
    let cancelled = false;
    import("./MonacoArvia").then((mod) => {
      if (!cancelled) mod.setMarkersOnCurrentModels(markers);
    });
    return () => {
      cancelled = true;
    };
  }, [markers]);

  const showEmptyHint =
    meta.components.length === 0 && meta.styles.length === 0 && editedApp[framework] == null;

  const sourceFiles = [
    { id: "arv" as const, name: "App.arv" },
    { id: "app" as const, name: appFileName },
    { id: "theme" as const, name: "theme.arv" },
  ];
  const generatedFiles = [
    { id: "css" as const, name: "App.css" },
    { id: "dts" as const, name: "App.arv.d.ts" },
  ];
  const editing = file === "arv" || file === "app" || file === "theme";

  const editorPath = file === "theme" ? "theme.arv" : file === "arv" ? "App.arv" : appFileName;
  const editorLanguage =
    file === "theme" || file === "arv" ? "arvia" : FRAMEWORKS[framework].monacoLanguage;
  const editorValue = file === "theme" ? themeSource : file === "arv" ? source : app;
  const onEditorChange =
    file === "theme"
      ? setThemeSource
      : file === "arv"
        ? setSource
        : (value: string) => setEditedApp((prev) => ({ ...prev, [framework]: value }));

  return (
    <div
      ref={rootRef}
      className={ide.root}
      style={{
        gridTemplateColumns: `${sidebarWidth}px ${HANDLE_PX}px minmax(0, ${split}fr) ${HANDLE_PX}px minmax(0, ${1 - split}fr)`,
      }}
    >
      <div className={ide.toolbar}>
        {props.templates ? (
          <select
            value={templateId}
            onChange={(e) => selectTemplate(e.target.value)}
            style={{
              padding: "2px 8px",
              borderRadius: 6,
              border: `1px solid ${tokens.color.border}`,
              background: tokens.color.surface,
              color: tokens.color.text,
              fontFamily: "inherit",
              fontSize: 12,
            }}
          >
            {props.initialSource ? (
              <option value="">
                <fbt desc="Playground template select — snippet loaded from URL">
                  {"shared snippet"}
                </fbt>
              </option>
            ) : null}
            {props.templates.map((group) => (
              <optgroup key={headingText(group.label)} label={headingText(group.label)}>
                {group.items.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        ) : null}
        <span className={pg.tabs}>
          {(Object.keys(FRAMEWORKS) as FrameworkId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={pg.tab}
              data-active={framework === id}
              onClick={() => setFramework(id)}
            >
              {FRAMEWORKS[id].label}
            </button>
          ))}
        </span>
        <button type="button" className={pg.tab} onClick={share}>
          {copied ? (
            <fbt desc="Playground share button — URL copied to clipboard">{"copied!"}</fbt>
          ) : (
            <fbt desc="Playground share button label">{"share"}</fbt>
          )}
        </button>
      </div>

      <nav className={ide.sidebar}>
        <span className={ide.sidebarLabel}>
          <fbt desc="Playground file explorer section label">{"files"}</fbt>
        </span>
        {sourceFiles.map((f) => (
          <button
            key={f.id}
            type="button"
            className={ide.fileItem}
            data-active={file === f.id}
            onClick={() => setFile(f.id)}
          >
            {f.name}
          </button>
        ))}
        <span className={ide.sidebarLabel} style={{ marginTop: 10 }}>
          <fbt desc="Playground file explorer section label">{"generated"}</fbt>
        </span>
        {generatedFiles.map((f) => (
          <button
            key={f.id}
            type="button"
            className={ide.fileItem}
            data-active={file === f.id}
            onClick={() => setFile(f.id)}
          >
            {f.name}
          </button>
        ))}
      </nav>

      <div {...resizerProps("sidebar")} />

      <div className={ide.editorPane}>
        {editing ? (
          <div className={ide.editorHost}>
            <Suspense
              fallback={
                <pre style={{ margin: 0, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
                  {editorValue}
                </pre>
              }
            >
              <MonacoArvia
                path={editorPath}
                language={editorLanguage}
                value={editorValue}
                onChange={onEditorChange}
                theme={siteTheme}
                markers={markers}
                height="100%"
              />
            </Suspense>
          </div>
        ) : (
          <div className={ide.generatedView}>
            {outputHtml ? (
              <div dangerouslySetInnerHTML={{ __html: outputHtml }} />
            ) : (
              <pre style={{ margin: 0 }}>{file === "css" ? css : dts}</pre>
            )}
          </div>
        )}
        {activeArvaErrors.length > 0 ? (
          <ul className={pg.diagnostics}>
            {activeArvaErrors.slice(0, 3).map((d, i) => (
              <li key={i}>
                {d.line}:{d.col} {d.code} — {d.message}
                {d.hint ? ` (${d.hint})` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div {...resizerProps("split")} />

      <div className={ide.previewPane}>
        <div className={ide.browserBar}>
          <span className={chrome.dots} aria-hidden>
            <span className={chrome.dotRed} />
            <span className={chrome.dotAmber} />
            <span className={chrome.dotGreen} />
          </span>
          <button
            type="button"
            className={ide.refreshBtn}
            onClick={() => setReloadToken((t) => t + 1)}
            aria-label={headingText(
              <fbt desc="Playground preview reload button label">{"Reload preview"}</fbt>,
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M20 11A8 8 0 1 0 18.9 15M20 5v6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className={ide.urlBar}>arvia.dev/preview/{framework}</span>
        </div>
        <div className={ide.browserBody} style={dragging ? { pointerEvents: "none" } : undefined}>
          {showEmptyHint || !lastPreview.current ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <span style={{ opacity: 0.6, fontSize: 13 }}>{emptyPreviewHint}</span>
            </div>
          ) : (
            <PreviewFrame
              framework={framework}
              css={lastPreview.current.css}
              designJs={lastPreview.current.designJs}
              appJs={lastPreview.current.appJs}
              buildError={build?.appError ?? null}
              theme={siteTheme}
              height={480}
              reloadToken={reloadToken}
            />
          )}
        </div>
      </div>
    </div>
  );
}
