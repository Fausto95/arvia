import { DocArticle } from "../../components/docs/DocArticle";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const packagesMeta: DocPageMeta = {
  slug: "packages",
  title: <fbt desc="Docs page title — Packages">{"Packages"}</fbt>,
  description: (
    <fbt desc="Docs page description — The @arviahq packages.">
      {"What lives under @arviahq, and what you actually install."}
    </fbt>
  ),
  nav: { section: "tooling", order: 6 },
  searchText:
    "Most projects install one package: the framework plugin. npm install -D @arviahq/vite-plugin-react (or -preact, -vue). It bundles the compiler, the arvia CLI, and arvia-tsc. Packages: @arviahq/vite-plugin-react/-preact/-vue — Vite plugin + CLI for your framework; @arviahq/typescript-plugin — optional, only if you use dts: false for virtual types instead of generated .d.ts; @arviahq/vite-plugin — the framework-agnostic core the wrappers re-export; @arviahq/compiler — the compiler API for custom tooling; @arviahq/language-server — LSP for editors without a bundled extension; @arviahq/docs and @arviahq/storybook — loaded on demand by arvia gen --docs / --storybook. All packages release in lockstep — keep them on matching versions. Related: Type checking, CLI.",
};

export function PackagesPage() {
  return (
    <DocArticle meta={packagesMeta}>
      <DocP>
        <fbt desc="Docs content — packages: what">
          {
            "Most projects install exactly one package — the framework plugin. It bundles the compiler, the `arvia` CLI, and `arvia-tsc`:"
          }
        </fbt>
      </DocP>
      <DocCode label={"terminal"} code={`npm install -D @arviahq/vite-plugin-react`} />
      <DocTable
        headers={[
          <fbt desc="Packages table header — package">{"Package"}</fbt>,
          <fbt desc="Packages table header — when">{"Install it when"}</fbt>,
        ]}
        rows={[
          [
            "@arviahq/vite-plugin-react · -preact · -vue",
            <fbt desc="Packages cell — framework">
              {"Always — the Vite plugin + CLI for your framework."}
            </fbt>,
          ],
          [
            "@arviahq/typescript-plugin",
            <fbt desc="Packages cell — ts plugin">
              {
                "Optional — only if you use `dts: false` for virtual types instead of generated `.d.ts` (see [Type checking](/docs/typecheck))."
              }
            </fbt>,
          ],
          [
            "@arviahq/vite-plugin",
            <fbt desc="Packages cell — core">
              {"You integrate a framework without an official wrapper."}
            </fbt>,
          ],
          [
            "@arviahq/compiler",
            <fbt desc="Packages cell — compiler">
              {"You build custom tooling (see [Compiler API](/docs/api-compiler))."}
            </fbt>,
          ],
          [
            "@arviahq/language-server",
            <fbt desc="Packages cell — ls">
              {"Editor setups without a bundled extension (e.g. Neovim)."}
            </fbt>,
          ],
          [
            "@arviahq/docs · @arviahq/storybook",
            <fbt desc="Packages cell — generators">
              {"Loaded on demand by `arvia gen --docs` / `--storybook`."}
            </fbt>,
          ],
        ]}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — packages: lockstep">
          {
            "All packages release in lockstep — keep them on matching versions if a type and the build output ever disagree."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
