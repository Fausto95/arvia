import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const vite_pluginMeta: DocPageMeta = {
  slug: "vite-plugin",
  title: <fbt desc="Docs page title — Vite plugin">{"Vite plugin"}</fbt>,
  description: (
    <fbt desc="Docs page description — Compile .arv files at build time with HMR.">
      {"How .arv imports compile, the options, and the HMR model."}
    </fbt>
  ),
  nav: { section: "tooling", order: 27 },
  searchText:
    'The Vite plugin makes `.arv` files importable modules: each import compiles to the generated JavaScript, with the CSS routed through Vite\'s own pipeline. The integration is identical across frameworks — only the JSX plugin next to it differs: vite.config.ts import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport { arvia } from "@arviahq/vite-plugin-react";\n\nexport default defineConfig({\n  plugins: [\n    arvia({\n      theme: "src/theme.arv", // shared theme (default: src/theme.arv if present)\n      dts: false,             // sibling .d.ts files (default: false)\n    }),\n    react(),\n  ],\n}); Option Default Meaning theme `src/theme.arv` when it exists Path (relative to the Vite root) of the file whose tokens, recipes, and keyframes every `.arv` file can see. dts false Write sibling `.d.ts` files next to each `.arv` file. Off by default — types come virtually from the TypeScript plugin; sibling files would shadow them. How an import flows When a module imports `button.arv`, the plugin compiles it against the shared theme environment and returns the generated JS with one line prepended: an import of the phantom module `button.arv.css`. That module does not exist on disk — the plugin serves the compiled CSS under that name, which hands styling to Vite\'s CSS pipeline: dev-server injection, build-time extraction, minification, and code-split CSS chunks all behave exactly as for a real stylesheet. Compile errors surface as Vite errors with file, line, and column — the dev overlay points at the `.arv` source. Warnings (unknown property, unused recipe…) reach the terminal without blocking the build. The HMR model You edit What happens Style values in a component file The JS is byte-identical (class names are path-hashed), so only the phantom CSS module updates — styles swap in place, no re-render. Structure in a component file (new variant, slot, default) JS changed too — the module and its CSS update through the normal HMR graph. The shared theme file Tokens may be inlined anywhere, so all caches reset and the page fully reloads. Theme edits are the expensive ones by design. Create or delete `.arv` files Watched: new files compile on first import (and get types immediately in dts mode); deleting a file cleans its caches and generated siblings. Cross-file name collisions Two files may both export a Button — hashes keep their CSS apart, and the plugin warns about the duplication since importing both into one module would force aliasing. The warning lists the files; rename one or alias at the import site. Keep arvia() before the framework plugin in the plugins array. It declares enforce: "pre" and must transform .arv imports before anything else interprets them.',
};

export function VitePluginPage() {
  return (
    <DocArticle meta={vite_pluginMeta}>
      <DocP>
        <fbt desc="Docs content — vite: opening">
          {
            "The Vite plugin makes `.arv` files importable modules: each import compiles to the generated JavaScript, with the CSS routed through Vite's own pipeline. The integration is identical across frameworks — only the JSX plugin next to it differs:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"vite.config.ts"}
        code={`import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [
    arvia({
      theme: "src/theme.arv", // shared theme (default: src/theme.arv if present)
      dts: false,             // sibling .d.ts files (default: false)
    }),
    react(),
  ],
});`}
      />
      <DocTable
        headers={[
          <fbt desc="Docs table header — option">{"Option"}</fbt>,
          <fbt desc="Docs table header — default">{"Default"}</fbt>,
          <fbt desc="Docs table header — meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "theme",
            <fbt desc="Docs table cell — vite theme default">
              {"`src/theme.arv` when it exists"}
            </fbt>,
            <fbt desc="Docs table cell — vite theme meaning">
              {
                "Path (relative to the Vite root) of the file whose tokens, recipes, and keyframes every `.arv` file can see."
              }
            </fbt>,
          ],
          [
            "dts",
            "false",
            <fbt desc="Docs table cell — vite dts meaning">
              {
                "Write sibling `.d.ts` files next to each `.arv` file. Off by default — types come virtually from the TypeScript plugin; sibling files would shadow them."
              }
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: import flow">{"How an import flows"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — vite: phantom css">
          {
            "When a module imports `button.arv`, the plugin compiles it against the shared theme environment and returns the generated JS with one line prepended: an import of the phantom module `button.arv.css`. That module does not exist on disk — the plugin serves the compiled CSS under that name, which hands styling to Vite's CSS pipeline: dev-server injection, build-time extraction, minification, and code-split CSS chunks all behave exactly as for a real stylesheet."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — vite: diagnostics flow">
          {
            "Compile errors surface as Vite errors with file, line, and column — the dev overlay points at the `.arv` source. Warnings (unknown property, unused recipe…) reach the terminal without blocking the build."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: hmr model">{"The HMR model"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="Docs table header — you edit">{"You edit"}</fbt>,
          <fbt desc="Docs table header — what happens">{"What happens"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — hmr style edit">{"Style values in a component file"}</fbt>,
            <fbt desc="Docs table cell — hmr style result">
              {
                "The JS is byte-identical (class names are path-hashed), so only the phantom CSS module updates — styles swap in place, no re-render."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — hmr structure edit">
              {"Structure in a component file (new variant, slot, default)"}
            </fbt>,
            <fbt desc="Docs table cell — hmr structure result">
              {"JS changed too — the module and its CSS update through the normal HMR graph."}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — hmr theme edit">{"The shared theme file"}</fbt>,
            <fbt desc="Docs table cell — hmr theme result">
              {
                "Tokens may be inlined anywhere, so all caches reset and the page fully reloads. Theme edits are the expensive ones by design."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — hmr add remove">{"Create or delete `.arv` files"}</fbt>,
            <fbt desc="Docs table cell — hmr add remove result">
              {
                "Watched: new files compile on first import (and get types immediately in dts mode); deleting a file cleans its caches and generated siblings."
              }
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: collisions">{"Cross-file name collisions"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — vite: collisions">
          {
            "Two files may both export a Button — hashes keep their CSS apart, and the plugin warns about the duplication since importing both into one module would force aliasing. The warning lists the files; rename one or alias at the import site."
          }
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — vite: plugin order">
          {
            'Keep arvia() before the framework plugin in the plugins array. It declares enforce: "pre" and must transform .arv imports before anything else interprets them.'
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
