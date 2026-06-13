import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const reactMeta: DocPageMeta = {
  slug: "react",
  title: <fbt desc="Docs page title — React">{"React"}</fbt>,
  description: (
    <fbt desc="Docs page description — Use Arvia in a React + Vite project.">
      {"Set up Arvia in a React + Vite project and use a component."}
    </fbt>
  ),
  nav: { section: "frameworks", order: 0 },
  searchText:
    'Install npm install -D @arviahq/vite-plugin-react Configure Vite. Put arvia() before the React plugin so .arv imports compile before JSX is transformed. vite.config.ts import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; import { arvia } from "@arviahq/vite-plugin-react"; export default defineConfig({ plugins: [arvia({ theme: "src/theme.arv" }), react()] }); Use a component. Importing a .arv file gives you a function; call it to get class names. button.arv component Button { base { padding: 8px 16px; background: #635bff; color: white; } } App.tsx import { Button } from "./button.arv"; export function App() { const s = Button(); return <button className={s.root}>Save</button>; } Type checking. By default the plugin writes declarations to .arvia/types; add rootDirs so tsc resolves .arv imports. tsconfig.json compilerOptions moduleResolution bundler rootDirs src .arvia/types. See Type checking for details and the dts: false alternative.',
};

export function ReactPage() {
  return (
    <DocArticle meta={reactMeta}>
      <DocP>
        <fbt desc="Docs content — react: intro">
          {
            "Arvia works in any React + Vite project through `@arviahq/vite-plugin-react`. It bundles the Vite plugin, the `arvia` CLI, and `arvia-tsc` in one package."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: install">{"Install"}</fbt>
      </DocH2>
      <DocCode label={"terminal"} code={`npm install -D @arviahq/vite-plugin-react`} />
      <DocH2>
        <fbt desc="Docs content — heading: configure vite">{"Configure Vite"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — react: plugin order">
          {
            "Add `arvia()` to your plugins, before the React plugin, so `.arv` imports compile before JSX is transformed."
          }
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
        <fbt desc="Docs content — heading: use a component">{"Use a component"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — react: usage">
          {
            "Importing a `.arv` file gives you a plain function. Call it to get class names, and put them on your own markup:"
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
  return <button className={s.root}>Save</button>;
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: type checking">{"Type checking"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — react: typecheck">
          {
            "By default the plugin writes type declarations into `.arvia/types`. Add a `rootDirs` overlay so plain `tsc` resolves `.arv` imports (the Vite `react-ts` template puts this in `tsconfig.app.json`):"
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
        <fbt desc="Docs note — react: typecheck link">
          {
            "See [Type checking](/docs/typecheck) for generating types in CI and the `dts: false` alternative (virtual types via `arvia-tsc`)."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
