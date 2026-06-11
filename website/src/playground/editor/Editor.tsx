import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";
import { Code } from "../../components/Code";
import { Text } from "../../components/text.arv";
import { useSiteTheme } from "../../site-theme";
import { EditorShell, OutputTabs } from "../playground-layout.arv";
import { arvHighlight } from "./arv-highlight";
import { DiagnosticList } from "./DiagnosticList";
import { EditorPreview } from "./EditorPreview";
import { DEFAULT_TEMPLATE, EDITOR_TEMPLATES } from "./templates";
import { useArviaCompiler } from "./useArviaCompiler";

type OutputTab = "preview" | "css" | "js" | "types" | "errors";

const editorTheme = EditorView.theme({
  "&": { fontSize: "13px" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { padding: "12px 0" },
  ".cm-line": { padding: "0 16px" },
  ".cm-gutters": { paddingRight: "8px" },
});

export function Editor() {
  const [source, setSource] = useState(DEFAULT_TEMPLATE.source);
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE.id);
  const [outputTab, setOutputTab] = useState<OutputTab>("preview");
  const { result, themeCss } = useArviaCompiler(source);
  const siteTheme = useSiteTheme();

  useEffect(() => {
    const template = EDITOR_TEMPLATES.find((t) => t.id === templateId);
    if (template) setSource(template.source);
  }, [templateId]);

  const tabs = OutputTabs();
  const shell = EditorShell();

  function tabClass(active: boolean) {
    return active ? tabs.tabActive : tabs.tab;
  }

  return (
    <div className={shell.root} style={{ minWidth: 0 }}>
      <div style={{ minWidth: 0, maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <label className={Text({ size: "sm", tone: "muted" }).root}>
            Template{" "}
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              style={{
                marginLeft: 8,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid var(--arvia-color-border)",
                background: "var(--arvia-color-surface)",
                color: "var(--arvia-color-text)",
                fontFamily: "inherit",
                fontSize: 14,
              }}
            >
              {EDITOR_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div
          style={{
            border: "1px solid var(--arvia-color-border)",
            borderRadius: 12,
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          <CodeMirror
            value={source}
            height="420px"
            theme={siteTheme === "dark" ? vscodeDark : vscodeLight}
            onChange={setSource}
            extensions={[editorTheme, ...arvHighlight]}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
            }}
          />
        </div>
      </div>

      <div style={{ minWidth: 0, maxWidth: "100%" }}>
        <div className={tabs.root}>
          {(
            [
              ["preview", "Preview"],
              ["css", "CSS"],
              ["js", "JS"],
              ["types", "Types"],
              ["errors", "Errors"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tabClass(outputTab === id)}
              onClick={() => setOutputTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          style={{
            border: "1px solid var(--arvia-color-border)",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--arvia-color-surface)",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          {outputTab === "preview" ? (
            <EditorPreview result={result} themeCss={themeCss} />
          ) : outputTab === "css" ? (
            result?.css ? (
              <Code lang="css" variant="flat">
                {result.css}
              </Code>
            ) : (
              <p className={Text({ size: "sm", tone: "muted" }).root} style={{ padding: 16 }}>
                No CSS — fix errors first.
              </p>
            )
          ) : outputTab === "js" ? (
            result?.js ? (
              <Code lang="javascript" variant="flat">
                {result.js}
              </Code>
            ) : (
              <p className={Text({ size: "sm", tone: "muted" }).root} style={{ padding: 16 }}>
                No JS — fix errors first.
              </p>
            )
          ) : outputTab === "types" ? (
            result?.dts ? (
              <Code lang="typescript" variant="flat">
                {result.dts}
              </Code>
            ) : (
              <p className={Text({ size: "sm", tone: "muted" }).root} style={{ padding: 16 }}>
                No types — fix errors first.
              </p>
            )
          ) : (
            <div style={{ padding: 16 }}>
              <DiagnosticList diagnostics={result?.diagnostics ?? []} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
