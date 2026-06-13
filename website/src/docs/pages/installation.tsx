import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const installationMeta: DocPageMeta = {
  slug: "installation",
  title: <fbt desc="Docs page title — Installation">{"Installation"}</fbt>,
  description: (
    <fbt desc="Docs page description — Add Arvia to a Vite project.">
      {"Add Arvia to a Vite project in three steps."}
    </fbt>
  ),
  nav: { section: "getting-started", order: 1 },
  searchText:
    'Arvia is a Vite plugin. Install the package for your framework: React npm install -D @arviahq/vite-plugin-react; Preact npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact; Vue npm install -D @arviahq/vite-plugin-vue @vitejs/plugin-vue vue. 1. Add the plugin. Put arvia() before your framework plugin. vite.config.ts import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; import { arvia } from "@arviahq/vite-plugin-react"; export default defineConfig({ plugins: [arvia({ theme: "src/theme.arv" }), react()] }); 2. Add a theme. The theme option points at one shared file whose tokens every .arv file can use; defaults to src/theme.arv. src/theme.arv theme { color { primary = #635bff; } } 3. Type checking. By default Arvia writes declarations to .arvia/types; add rootDirs so tsc resolves .arv imports. See the Frameworks pages and Type checking. Editor setup: install the Arvia extension for VS Code or Zed for diagnostics, completion, and hover.',
};

export function InstallationPage() {
  return (
    <DocArticle meta={installationMeta}>
      <DocP>
        <fbt desc="Docs content — install: intro">
          {
            "Arvia is a Vite plugin. Install the package for your framework — each one bundles the plugin, the `arvia` CLI, and type-checking tools:"
          }
        </fbt>
      </DocP>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — install react">
            {"[React](/docs/react) — `npm install -D @arviahq/vite-plugin-react`"}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — install preact">
            {"[Preact](/docs/preact) — `npm install -D @arviahq/vite-plugin-preact`"}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — install vue">
            {"[Vue](/docs/vue) — `npm install -D @arviahq/vite-plugin-vue`"}
          </fbt>
        </DocLi>
      </DocUl>
      <DocP>
        <fbt desc="Docs content — install: react example note">
          {"The rest of this page uses React; the steps are identical for every framework."}
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: add the plugin">{"1. Add the plugin"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — install: plugin order">
          {"Add `arvia()` to your Vite config, before your framework plugin:"}
        </fbt>
      </DocP>
      <DocCode
        label={"vite.config.ts"}
        code={`import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" }), react()],
});`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: add a theme">{"2. Add a theme"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — install: theme">
          {
            "The `theme` option points at one shared file whose tokens every `.arv` file can use — that's how `color.primary` resolves without an import. It defaults to `src/theme.arv` when present."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  color {
    primary = #635bff;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — install: import theme">
          {"Import the theme once in your entry file so its global CSS and tokens ship:"}
        </fbt>
      </DocP>
      <DocCode label={"src/main.tsx"} code={`import "./theme.arv";`} />
      <DocH2>
        <fbt desc="Docs content — heading: type checking">{"3. Type checking"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — install: typecheck">
          {
            'By default Arvia writes type declarations into `.arvia/types`. Add a `rootDirs` overlay so plain `tsc` resolves `.arv` imports (needs `moduleResolution: "bundler"`, Vite\'s default):'
          }
        </fbt>
      </DocP>
      <DocCode
        label={"tsconfig.json"}
        code={`{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "rootDirs": ["src", ".arvia/types"]
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — install: typecheck link">
          {
            "Your [framework page](/docs/react) has the exact setup, and [Type checking](/docs/typecheck) covers CI and the file-less `arvia-tsc` alternative."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: editor setup">{"Editor setup"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — install: editor">
          {
            "Install the Arvia extension for [VS Code](https://marketplace.visualstudio.com/items?itemName=arviahq.arvia) or Zed to get diagnostics, token and variant completion, hover docs, and go-to-definition in `.arv` files. See [Language server](/docs/language-server) for other editors."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — install: next">
          {"Set up? Continue to the [Quick start](/docs/quick-start)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
