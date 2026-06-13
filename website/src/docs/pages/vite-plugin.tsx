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
    <fbt desc="Docs page description — Compile .arv with HMR.">
      {"Compile .arv imports, with options and an HMR model."}
    </fbt>
  ),
  nav: { section: "tooling", order: 0 },
  searchText:
    'The arvia() plugin compiles each .arv import to its generated JS and routes the CSS through Vite. Add it before your framework plugin. plugins: [arvia({ theme: "src/theme.arv" }), react()]. Options: theme — path to the shared theme file (default src/theme.arv if present); dts — how to emit type declarations: "central" (default) writes .d.ts into .arvia/types, "sibling" / true writes foo.arv.d.ts next to each source, false writes nothing (use the typescript-plugin instead). See Type checking. HMR: editing style values swaps CSS in place with no reload (class names are path-hashed so the JS is byte-identical); structural edits update the module; theme edits reload the page. Related: Type checking, CLI, Frameworks.',
};

export function VitePluginPage() {
  return (
    <DocArticle meta={vite_pluginMeta}>
      <DocP>
        <fbt desc="Docs content — vite-plugin: what">
          {
            "The `arvia()` plugin compiles each `.arv` import to its generated JavaScript and routes the CSS through Vite's own pipeline. Add it before your framework plugin:"
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
        <fbt desc="Docs content — heading: options">{"Options"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="Vite plugin table header — option">{"Option"}</fbt>,
          <fbt desc="Vite plugin table header — meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "theme",
            <fbt desc="Vite plugin cell — theme">
              {"Path to the shared theme file. Defaults to `src/theme.arv` when present."}
            </fbt>,
          ],
          [
            "dts",
            <fbt desc="Vite plugin cell — dts">
              {
                "How to emit type declarations: `'central'` (default) writes `.arvia/types`; `'sibling'`/`true` writes `foo.arv.d.ts` next to each source; `false` writes nothing. See [Type checking](/docs/typecheck)."
              }
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: hmr">{"The HMR model"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — vite-plugin: hmr">
          {
            "Class names are hashed from the file path, not the declarations — so editing style values produces byte-identical JS, and the dev server swaps the CSS in place with no reload. Structural edits (a new variant or slot) update the module normally; theme edits reload the page, since tokens can affect everything."
          }
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — vite-plugin: errors">
          {
            'Compile errors surface as Vite errors with file, line, and column — the dev overlay points at the `.arv` source. The plugin must stay before the framework plugin (it declares `enforce: "pre"`).'
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — vite-plugin: related">
          {
            "Related: [Type checking](/docs/typecheck) · [CLI](/docs/cli) · [Frameworks](/docs/react)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
