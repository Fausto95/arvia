import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const vueMeta: DocPageMeta = {
  slug: "vue",
  title: <fbt desc="Docs page title — Vue">{"Vue"}</fbt>,
  description: (
    <fbt desc="Docs page description — Use Arvia in a Vue + Vite project.">
      {"Set up Arvia in a Vue + Vite project and use a component in an SFC."}
    </fbt>
  ),
  nav: { section: "frameworks", order: 2 },
  searchText:
    'Install npm install -D @arviahq/vite-plugin-vue @vitejs/plugin-vue vue Configure Vite. Put arvia() before the Vue plugin so .arv imports compile first. vite.config.ts import { defineConfig } from "vite"; import vue from "@vitejs/plugin-vue"; import { arvia } from "@arviahq/vite-plugin-vue"; export default defineConfig({ plugins: [arvia({ theme: "src/theme.arv" }), vue()] }); Use a component in an SFC. App.vue <script setup lang="ts"> import { Button } from "./button.arv"; const s = Button(); </script> <template> <button :class="s.root">Save</button> </template> Type checking. Vue projects type-check with the Vue-aware arvia-tsc, because plain tsc cannot check .vue single-file components. Set dts false and use arvia-tsc in place of vue-tsc. typecheck arvia-tsc --noEmit.',
};

export function VuePage() {
  return (
    <DocArticle meta={vueMeta}>
      <DocP>
        <fbt desc="Docs content — vue: intro">
          {
            "Arvia works in any Vue + Vite project through `@arviahq/vite-plugin-vue`. It bundles the Vite plugin, the `arvia` CLI, and a Vue-aware `arvia-tsc`."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: install">{"Install"}</fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`npm install -D @arviahq/vite-plugin-vue @vitejs/plugin-vue vue`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: configure vite">{"Configure Vite"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — vue: plugin order">
          {"Add `arvia()` to your plugins, before the Vue plugin, so `.arv` imports compile first."}
        </fbt>
      </DocP>
      <DocCode
        label={"vite.config.ts"}
        code={`import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { arvia } from "@arviahq/vite-plugin-vue";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" }), vue()],
});`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: use in an SFC">{"Use it in an SFC"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — vue: usage">
          {
            "Import a `.arv` file in `<script setup>` and bind the returned class names with `:class`:"
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
        label={"src/App.vue"}
        code={`<script setup lang="ts">
import { Button } from "./button.arv";

const s = Button();
</script>

<template>
  <button :class="s.root">Save</button>
</template>`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: type checking">{"Type checking"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — vue: typecheck">
          {
            "Vue projects type-check with the Vue-aware `arvia-tsc`, which loads the Vue language plugin alongside Arvia's — use it in place of `vue-tsc`. Plain `tsc` cannot type-check `.vue` single-file components, so set `dts: false` to skip generating files you won't use:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"package.json"}
        code={`{
  "scripts": {
    "typecheck": "arvia-tsc --noEmit"
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — vue: typecheck link">
          {
            "If you also import `.arv` from plain `.ts`/`.tsx` files and want `tsc` to resolve those, see [Type checking](/docs/typecheck) for the central `.d.ts` mode."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
