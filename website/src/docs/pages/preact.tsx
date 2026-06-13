import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const preactMeta: DocPageMeta = {
  slug: "preact",
  title: <fbt desc="Docs page title — Preact">{"Preact"}</fbt>,
  description: (
    <fbt desc="Docs page description — Use Arvia in a Preact + Vite project.">
      {"Set up Arvia in a Preact + Vite project and use a component."}
    </fbt>
  ),
  nav: { section: "frameworks", order: 1 },
  searchText:
    'Install npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact Configure Vite. Put arvia() before the Preact preset so .arv imports compile first. vite.config.ts import { defineConfig } from "vite"; import preact from "@preact/preset-vite"; import { arvia } from "@arviahq/vite-plugin-preact"; export default defineConfig({ plugins: [arvia({ theme: "src/theme.arv" }), preact()] }); Use a component. Importing a .arv file gives you a function; call it to get class names. import { Button } from "./button.arv"; const s = Button(); <button class={s.root}>Save</button>. Type checking. By default the plugin writes declarations to .arvia/types; add rootDirs so tsc resolves .arv imports. See Type checking for details and the dts: false alternative.',
};

export function PreactPage() {
  return (
    <DocArticle meta={preactMeta}>
      <DocP>
        <fbt desc="Docs content — preact: intro">
          {
            "Arvia works in any Preact + Vite project through `@arviahq/vite-plugin-preact`. It bundles the Vite plugin, the `arvia` CLI, and `arvia-tsc` in one package."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: install">{"Install"}</fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: configure vite">{"Configure Vite"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — preact: plugin order">
          {
            "Add `arvia()` to your plugins, before the Preact preset, so `.arv` imports compile before JSX is transformed."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"vite.config.ts"}
        code={`import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { arvia } from "@arviahq/vite-plugin-preact";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" }), preact()],
});`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: use a component">{"Use a component"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — preact: usage">
          {
            "Importing a `.arv` file gives you a plain function. Call it to get class names, and put them on your own markup (Preact uses `class`):"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`component Button {
  base {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #635bff;
    color: white;
  }
}`}
      />
      <DocCode
        label={"src/App.tsx"}
        code={`import { Button } from "./button.arv";

export function App() {
  const s = Button();
  return <button class={s.root}>Save</button>;
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: type checking">{"Type checking"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — preact: typecheck">
          {
            "By default the plugin writes type declarations into `.arvia/types`. Add a `rootDirs` overlay so plain `tsc` resolves `.arv` imports:"
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
        <fbt desc="Docs note — preact: typecheck link">
          {
            "See [Type checking](/docs/typecheck) for generating types in CI and the `dts: false` alternative (virtual types via `arvia-tsc`)."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
