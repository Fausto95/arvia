import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
// Monarch-only TypeScript/TSX highlighting — no language-service worker needed.
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import { registerArviaProviders } from "./monaco-arvia-providers";

self.MonacoEnvironment = {
  getWorker: () => new editorWorker(),
};
loader.config({ monaco });

const KEYWORDS = [
  "theme",
  "global",
  "recipe",
  "keyframes",
  "style",
  "component",
  "base",
  "slots",
  "variants",
  "defaults",
  "responsive",
  "container",
  "compound",
  "tokens",
  "use",
  "modes",
];

monaco.languages.register({ id: "arvia" });
// Completion, hover and color decorators from the language server's
// browser-safe core (direct calls, no worker).
registerArviaProviders();

monaco.languages.setLanguageConfiguration("arvia", {
  comments: { lineComment: "//", blockComment: ["/*", "*/"] },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
});

monaco.languages.setMonarchTokensProvider("arvia", {
  keywords: KEYWORDS,
  tokenizer: {
    root: [
      [/\/\/.*$/, "comment"],
      [/\/\*/, "comment", "@comment"],
      [/"([^"\\]|\\.)*"/, "string"],
      [/'([^'\\]|\\.)*'/, "string"],
      [/#[0-9a-fA-F]{3,8}\b/, "number.hex"],
      [/&[^\s{]*/, "tag"],
      [/@[A-Za-z_][\w-]*/, "tag"],
      [/[A-Za-z_][\w-]*\.[\w-]+/, "variable.name"],
      [/-?\d+(\.\d+)?[a-z%]*/, "number"],
      [
        /[A-Za-z_-][\w-]*(?=\s*:)/,
        { cases: { "@keywords": "keyword", "@default": "attribute.name" } },
      ],
      [/[A-Za-z_-][\w-]*/, { cases: { "@keywords": "keyword", "@default": "identifier" } }],
      [/[{}();:=|]/, "delimiter"],
    ],
    comment: [
      [/[^*/]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[*/]/, "comment"],
    ],
  },
});

monaco.editor.defineTheme("arvia-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "ff7b72" },
    { token: "attribute.name", foreground: "79c0ff" },
    { token: "variable.name", foreground: "d2a8ff" },
    { token: "identifier", foreground: "c9d1d9" },
    { token: "number", foreground: "79c0ff" },
    { token: "number.hex", foreground: "a5d6ff" },
    { token: "string", foreground: "a5d6ff" },
    { token: "comment", foreground: "8b949e" },
    { token: "tag", foreground: "7ee787" },
    { token: "delimiter", foreground: "8b949e" },
  ],
  colors: {
    "editor.background": "#0d1117",
    "editor.lineHighlightBackground": "#161b22",
    "editorLineNumber.foreground": "#484f58",
  },
});

monaco.editor.defineTheme("arvia-light", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "cf222e" },
    { token: "attribute.name", foreground: "0550ae" },
    { token: "variable.name", foreground: "8250df" },
    { token: "identifier", foreground: "1f2328" },
    { token: "number", foreground: "0550ae" },
    { token: "number.hex", foreground: "0a3069" },
    { token: "string", foreground: "0a3069" },
    { token: "comment", foreground: "6e7781" },
    { token: "tag", foreground: "116329" },
    { token: "delimiter", foreground: "6e7781" },
  ],
  colors: {
    "editor.background": "#f6f8fa",
    "editor.lineHighlightBackground": "#eaeef2",
    "editorLineNumber.foreground": "#8c959f",
  },
});

export interface ArviaMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
}

export default function MonacoArvia(props: {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
  markers: ArviaMarker[];
  height: number;
  language?: "arvia" | "typescript";
  path?: string;
}) {
  return (
    <Editor
      height={props.height}
      path={props.path}
      language={props.language ?? "arvia"}
      theme={props.theme === "dark" ? "arvia-dark" : "arvia-light"}
      value={props.value}
      onChange={(value) => props.onChange(value ?? "")}
      onMount={(editor) => {
        const model = editor.getModel();
        if (model && model.getLanguageId() === "arvia") applyMarkers(model, props.markers);
        if (import.meta.env.DEV) {
          const w = window as unknown as Record<string, unknown>;
          w.__arviaEditor = editor;
          w.__arviaMonaco = monaco;
        }
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontLigatures: true,
        lineHeight: 20.8,
        lineNumbers: "off",
        folding: false,
        glyphMargin: false,
        scrollBeyondLastLine: false,
        renderLineHighlight: "none",
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: { vertical: "auto", horizontal: "auto", verticalScrollbarSize: 8 },
        padding: { top: 14, bottom: 14 },
        tabSize: 2,
        wordWrap: "off",
        contextmenu: false,
        automaticLayout: true,
      }}
    />
  );
}

export function applyMarkers(model: monaco.editor.ITextModel, markers: ArviaMarker[]): void {
  monaco.editor.setModelMarkers(
    model,
    "arvia",
    markers.map((m) => ({ ...m, severity: monaco.MarkerSeverity.Error })),
  );
}

export function setMarkersOnCurrentModels(markers: ArviaMarker[]): void {
  for (const model of monaco.editor.getModels()) {
    if (model.getLanguageId() === "arvia") applyMarkers(model, markers);
  }
}
