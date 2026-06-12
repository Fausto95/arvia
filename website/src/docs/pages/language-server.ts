import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function languageServer(): DocSection {
  return {
    title: fbt("Language server", "Docs page title — Language server"),
    slug: "language-server",
    description: fbt(
      "Editor intelligence for .arv files: diagnostics, completion, hover, navigation.",
      "Docs page description — Editor intelligence for .arv files.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "The language server runs the same compiler your build uses, so what the editor says and what the build does never disagree. What you get in any LSP-capable editor:",
          "Docs content — lsp: opening",
        ),
      },
      {
        type: "ul",
        items: [
          fbt(
            "Diagnostics as you type — every checker error and warning, with the same codes and hints as the build (ARV101 unknown token, ARV121 bad compound matcher, …).",
            "Docs list item — lsp diagnostics",
          ),
          fbt(
            "Quick fixes — did-you-mean diagnostics carry structured edits, so `color.primry` → `color.primary` is one code action.",
            "Docs list item — lsp quick fixes",
          ),
          fbt(
            "Completion — token names by group, variant values in defaults and compound matchers, slot names in sub-blocks, recipe names after use, keywords in context.",
            "Docs list item — lsp completion",
          ),
          fbt(
            "Hover — tokens show their value (per mode where applicable) and doc string; components and styles show a preview of their compiled CSS.",
            "Docs list item — lsp hover",
          ),
          fbt(
            "Go to definition — from a token reference, `use` statement, or keyframes reference to where it is declared, across files into the theme.",
            "Docs list item — lsp goto def",
          ),
        ],
      },
      { type: "h2", text: fbt("Editor setup", "Docs content — heading: lsp editor setup") },
      {
        type: "table",
        headers: [
          fbt("Editor", "Docs table header — editor"),
          fbt("Setup", "Docs table header — setup"),
        ],
        rows: [
          [
            fbt("VS Code", "Docs table cell — lsp vscode"),
            fbt(
              "Install the [Arvia extension](https://marketplace.visualstudio.com/items?itemName=arviahq.arvia) — syntax highlighting and the server are bundled and start automatically.",
              "Docs table cell — lsp vscode setup",
            ),
          ],
          [
            fbt("Zed", "Docs table cell — lsp zed"),
            fbt(
              "Install the Arvia extension from the registry.",
              "Docs table cell — lsp zed setup",
            ),
          ],
          [
            fbt("Neovim", "Docs table cell — lsp neovim"),
            fbt(
              "Tree-sitter grammar for highlighting; point lspconfig at the arvia-language-server binary from @arviahq/language-server (stdio).",
              "Docs table cell — lsp neovim setup",
            ),
          ],
        ],
      },
      { type: "h2", text: fbt("Formatting", "Docs content — heading: lsp formatting") },
      {
        type: "p",
        text: fbt(
          "The language server also provides document formatting — a canonical `.arv` style with two-space indentation and one-line blocks up to 100 columns. It is deliberately conservative: sources with parse errors are returned unchanged, comments are preserved verbatim, and the formatter fails closed — if the output would differ from the input in anything but whitespace, it refuses and leaves your file alone.",
          "Docs content — lsp: formatting overview",
        ),
      },
      {
        type: "code",
        label: ".vscode/settings.json",
        lang: "json",
        code: `{
  "[arvia]": {
    "editor.defaultFormatter": "arviahq.arvia",
    "editor.formatOnSave": true
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "For your own tooling, the formatter is a plain function: `formatArv(source, { indent, printWidth })` exported from `@arviahq/compiler`.",
          "Docs content — lsp: formatArv api",
        ),
      },
      { type: "h2", text: fbt("Types for your TSX", "Docs content — heading: lsp types tsx") },
      {
        type: "p",
        text: fbt(
          "The language server covers `.arv` files; typed props inside .tsx come from the separate @arviahq/typescript-plugin, which serves declarations for `.arv` imports as virtual modules inside tsserver — no files on disk during development. The two share the compiler, so both react to edits immediately: add a variant value and the union type at your call sites updates as soon as the file is saved.",
          "Docs content — lsp: typescript plugin relationship",
        ),
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "If `.arv` imports show as any in VS Code, the editor is using its bundled TypeScript instead of the workspace's — run “TypeScript: Select TypeScript Version” → “Use Workspace Version” so tsconfig plugins load.",
          "Docs note — lsp: workspace ts version",
        ),
      },
    ],
  };
}
