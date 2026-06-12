import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const language_serverMeta: DocPageMeta = {
  slug: "language-server",
  title: <fbt desc="Docs page title — Language server">{"Language server"}</fbt>,
  description: (
    <fbt desc="Docs page description — Editor intelligence for .arv files.">
      {"Editor intelligence for .arv files: diagnostics, completion, hover, navigation."}
    </fbt>
  ),
  nav: { section: "tooling", order: 29 },
  searchText:
    'The language server runs the same compiler your build uses, so what the editor says and what the build does never disagree. What you get in any LSP-capable editor: Diagnostics as you type — every checker error and warning, with the same codes and hints as the build (ARV101 unknown token, ARV121 bad compound matcher, …). Quick fixes — did-you-mean diagnostics carry structured edits, so `color.primry` → `color.primary` is one code action. Completion — token names by group, variant values in defaults and compound matchers, slot names in sub-blocks, recipe names after use, keywords in context. Hover — tokens show their value (per mode where applicable) and doc string; components and styles show a preview of their compiled CSS. Go to definition — from a token reference, `use` statement, or keyframes reference to where it is declared, across files into the theme. Editor setup Editor Setup VS Code Install the [Arvia extension](https://marketplace.visualstudio.com/items?itemName=arviahq.arvia) — syntax highlighting and the server are bundled and start automatically. Zed Install the Arvia extension from the registry. Neovim Tree-sitter grammar for highlighting; point lspconfig at the arvia-language-server binary from @arviahq/language-server (stdio). Formatting The language server also provides document formatting — a canonical `.arv` style with two-space indentation and one-line blocks up to 100 columns. It is deliberately conservative: sources with parse errors are returned unchanged, comments are preserved verbatim, and the formatter fails closed — if the output would differ from the input in anything but whitespace, it refuses and leaves your file alone. .vscode/settings.json {\n  "[arvia]": {\n    "editor.defaultFormatter": "arviahq.arvia",\n    "editor.formatOnSave": true\n  }\n} For your own tooling, the formatter is a plain function: `formatArv(source, { indent, printWidth })` exported from `@arviahq/compiler`. Types for your TSX The language server covers `.arv` files; typed props inside .tsx come from the separate @arviahq/typescript-plugin, which serves declarations for `.arv` imports as virtual modules inside tsserver — no files on disk during development. The two share the compiler, so both react to edits immediately: add a variant value and the union type at your call sites updates as soon as the file is saved. If `.arv` imports show as any in VS Code, the editor is using its bundled TypeScript instead of the workspace\'s — run “TypeScript: Select TypeScript Version” → “Use Workspace Version” so tsconfig plugins load.',
};

export function LanguageServerPage() {
  return (
    <DocArticle meta={language_serverMeta}>
      <DocP>
        <fbt desc="Docs content — lsp: opening">
          {
            "The language server runs the same compiler your build uses, so what the editor says and what the build does never disagree. What you get in any LSP-capable editor:"
          }
        </fbt>
      </DocP>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — lsp diagnostics">
            {
              "Diagnostics as you type — every checker error and warning, with the same codes and hints as the build (ARV101 unknown token, ARV121 bad compound matcher, …)."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — lsp quick fixes">
            {
              "Quick fixes — did-you-mean diagnostics carry structured edits, so `color.primry` → `color.primary` is one code action."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — lsp completion">
            {
              "Completion — token names by group, variant values in defaults and compound matchers, slot names in sub-blocks, recipe names after use, keywords in context."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — lsp hover">
            {
              "Hover — tokens show their value (per mode where applicable) and doc string; components and styles show a preview of their compiled CSS."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — lsp goto def">
            {
              "Go to definition — from a token reference, `use` statement, or keyframes reference to where it is declared, across files into the theme."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: lsp editor setup">{"Editor setup"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="Docs table header — editor">{"Editor"}</fbt>,
          <fbt desc="Docs table header — setup">{"Setup"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — lsp vscode">{"VS Code"}</fbt>,
            <fbt desc="Docs table cell — lsp vscode setup">
              {
                "Install the [Arvia extension](https://marketplace.visualstudio.com/items?itemName=arviahq.arvia) — syntax highlighting and the server are bundled and start automatically."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — lsp zed">{"Zed"}</fbt>,
            <fbt desc="Docs table cell — lsp zed setup">
              {"Install the Arvia extension from the registry."}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — lsp neovim">{"Neovim"}</fbt>,
            <fbt desc="Docs table cell — lsp neovim setup">
              {
                "Tree-sitter grammar for highlighting; point lspconfig at the arvia-language-server binary from @arviahq/language-server (stdio)."
              }
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: lsp formatting">{"Formatting"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — lsp: formatting overview">
          {
            "The language server also provides document formatting — a canonical `.arv` style with two-space indentation and one-line blocks up to 100 columns. It is deliberately conservative: sources with parse errors are returned unchanged, comments are preserved verbatim, and the formatter fails closed — if the output would differ from the input in anything but whitespace, it refuses and leaves your file alone."
          }
        </fbt>
      </DocP>
      <DocCode
        label={".vscode/settings.json"}
        lang={"json"}
        code={`{
  "[arvia]": {
    "editor.defaultFormatter": "arviahq.arvia",
    "editor.formatOnSave": true
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — lsp: formatArv api">
          {
            "For your own tooling, the formatter is a plain function: `formatArv(source, { indent, printWidth })` exported from `@arviahq/compiler`."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: lsp types tsx">{"Types for your TSX"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — lsp: typescript plugin relationship">
          {
            "The language server covers `.arv` files; typed props inside .tsx come from the separate @arviahq/typescript-plugin, which serves declarations for `.arv` imports as virtual modules inside tsserver — no files on disk during development. The two share the compiler, so both react to edits immediately: add a variant value and the union type at your call sites updates as soon as the file is saved."
          }
        </fbt>
      </DocP>
      <DocCallout tone="warning">
        <fbt desc="Docs note — lsp: workspace ts version">
          {
            "If `.arv` imports show as any in VS Code, the editor is using its bundled TypeScript instead of the workspace's — run “TypeScript: Select TypeScript Version” → “Use Workspace Version” so tsconfig plugins load."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
