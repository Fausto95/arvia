import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const packagesMeta: DocPageMeta = {
  slug: "packages",
  title: <fbt desc="Docs page title — Packages">{"Packages"}</fbt>,
  description: (
    <fbt desc="Docs page description — npm packages under @arviahq.">
      {"What lives under @arviahq, and which packages your project actually needs."}
    </fbt>
  ),
  nav: { section: "tooling", order: 26 },
  searchText:
    "Most projects install exactly two packages: the Vite plugin for their framework and the TypeScript plugin. Everything else is either pulled in as a dependency or installed on demand for specific tooling: Package What it is Install it when @arviahq/vite-plugin-react Vite plugin + arvia CLI for React projects. You `use React` + Vite. @arviahq/vite-plugin-preact Vite plugin + arvia CLI for Preact projects. You `use Preact` + Vite. @arviahq/vite-plugin-vue Vite plugin + arvia CLI for Vue projects. You `use Vue` + Vite. @arviahq/typescript-plugin tsserver plugin + `arvia-tsc`; serves `.arv` types virtually. Always, alongside any Vite plugin. @arviahq/vite-plugin The framework-agnostic core the framework plugins re-export. You integrate a framework without an official plugin. @arviahq/compiler The compiler itself: compile(), analyze(), diagnostics. You build custom tooling on top of Arvia. @arviahq/language-server LSP server for `.arv` files. Editor setups without a bundled extension (e.g. Neovim). @arviahq/storybook CSF story generator behind `arvia gen --storybook`. You generate stories from components. @arviahq/docs Token catalog generator behind `arvia gen --docs`. You publish a token reference. A typical setup terminal npm install -D @arviahq/vite-plugin-react @arviahq/typescript-plugin The framework plugins bundle the compiler and re-export the arvia CLI, so the two-package install covers building, type checking, and code generation. Editor extensions (VS Code, Zed) ship their own copy of the language server. Versioning All packages release in lockstep from one repository — keep them on matching versions. If types and build output ever disagree, the first thing to check is a version skew between the Vite plugin and the TypeScript plugin.",
};

export function PackagesPage() {
  return (
    <DocArticle meta={packagesMeta}>
      <DocP>
        <fbt desc="Docs content — packages: opening">
          {
            "Most projects install exactly two packages: the Vite plugin for their framework and the TypeScript plugin. Everything else is either pulled in as a dependency or installed on demand for specific tooling:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — package">{"Package"}</fbt>,
          <fbt desc="Docs table header — package what">{"What it is"}</fbt>,
          <fbt desc="Docs table header — install when">{"Install it when"}</fbt>,
        ]}
        rows={[
          [
            "@arviahq/vite-plugin-react",
            <fbt desc="Docs table cell — pkg react">
              {"Vite plugin + arvia CLI for React projects."}
            </fbt>,
            <fbt desc="Docs table cell — pkg react when">{"You `use React` + Vite."}</fbt>,
          ],
          [
            "@arviahq/vite-plugin-preact",
            <fbt desc="Docs table cell — pkg preact">
              {"Vite plugin + arvia CLI for Preact projects."}
            </fbt>,
            <fbt desc="Docs table cell — pkg preact when">{"You `use Preact` + Vite."}</fbt>,
          ],
          [
            "@arviahq/vite-plugin-vue",
            <fbt desc="Docs table cell — pkg vue">
              {"Vite plugin + arvia CLI for Vue projects."}
            </fbt>,
            <fbt desc="Docs table cell — pkg vue when">{"You `use Vue` + Vite."}</fbt>,
          ],
          [
            "@arviahq/typescript-plugin",
            <fbt desc="Docs table cell — pkg ts">
              {"tsserver plugin + `arvia-tsc`; serves `.arv` types virtually."}
            </fbt>,
            <fbt desc="Docs table cell — pkg ts when">{"Always, alongside any Vite plugin."}</fbt>,
          ],
          [
            "@arviahq/vite-plugin",
            <fbt desc="Docs table cell — pkg core vite">
              {"The framework-agnostic core the framework plugins re-export."}
            </fbt>,
            <fbt desc="Docs table cell — pkg core vite when">
              {"You integrate a framework without an official plugin."}
            </fbt>,
          ],
          [
            "@arviahq/compiler",
            <fbt desc="Docs table cell — pkg compiler">
              {"The compiler itself: compile(), analyze(), diagnostics."}
            </fbt>,
            <fbt desc="Docs table cell — pkg compiler when">
              {"You build custom tooling on top of Arvia."}
            </fbt>,
          ],
          [
            "@arviahq/language-server",
            <fbt desc="Docs table cell — pkg lsp">{"LSP server for `.arv` files."}</fbt>,
            <fbt desc="Docs table cell — pkg lsp when">
              {"Editor setups without a bundled extension (e.g. Neovim)."}
            </fbt>,
          ],
          [
            "@arviahq/storybook",
            <fbt desc="Docs table cell — pkg storybook">
              {"CSF story generator behind `arvia gen --storybook`."}
            </fbt>,
            <fbt desc="Docs table cell — pkg storybook when">
              {"You generate stories from components."}
            </fbt>,
          ],
          [
            "@arviahq/docs",
            <fbt desc="Docs table cell — pkg docs">
              {"Token catalog generator behind `arvia gen --docs`."}
            </fbt>,
            <fbt desc="Docs table cell — pkg docs when">{"You publish a token reference."}</fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: typical setup">{"A typical setup"}</fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`npm install -D @arviahq/vite-plugin-react @arviahq/typescript-plugin`}
      />
      <DocP>
        <fbt desc="Docs content — packages: typical setup explanation">
          {
            "The framework plugins bundle the compiler and re-export the arvia CLI, so the two-package install covers building, type checking, and code generation. Editor extensions (VS Code, Zed) ship their own copy of the language server."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: versioning">{"Versioning"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — packages: versioning">
          {
            "All packages release in lockstep from one repository — keep them on matching versions. If types and build output ever disagree, the first thing to check is a version skew between the Vite plugin and the TypeScript plugin."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
