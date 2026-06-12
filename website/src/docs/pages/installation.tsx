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
    <fbt desc="Docs page description — Add Arvia to a Vite project and set up your editor.">
      {"Add Arvia to a Vite project and set up your editor."}
    </fbt>
  ),
  nav: { section: "getting-started", order: 1 },
  searchText:
    'Arvia integrates through a Vite plugin that compiles `.arv` imports on the fly. Pick the package that matches your framework — the compiler underneath is identical, only the surrounding JSX tooling differs. React terminal npm install -D @arviahq/vite-plugin-react vite.config.ts import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport { arvia } from "@arviahq/vite-plugin-react";\n\nexport default defineConfig({\n  plugins: [\n    arvia({ theme: "src/theme.arv" }),\n    react(),\n  ],\n}); The arvia() plugin must come before the framework plugin so `.arv` imports are compiled before JSX transformation touches them. Preact terminal npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact vite.config.ts import { defineConfig } from "vite";\nimport preact from "@preact/preset-vite";\nimport { arvia } from "@arviahq/vite-plugin-preact";\n\nexport default defineConfig({\n  plugins: [\n    arvia({ theme: "src/theme.arv" }),\n    preact(),\n  ],\n}); Vue terminal npm install -D @arviahq/vite-plugin-vue @vitejs/plugin-vue vue vite.config.ts import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\nimport { arvia } from "@arviahq/vite-plugin-vue";\n\nexport default defineConfig({\n  plugins: [\n    arvia({ theme: "src/theme.arv" }),\n    vue(),\n  ],\n}); App.vue <script setup lang="ts">\nimport { Button } from "./button.arv";\n\nconst styles = Button({ size: "lg", tone: "primary" });\n</script>\n\n<template>\n  <button :class="styles.root">Save</button>\n</template> The theme option The theme option names one shared theme file whose tokens, recipes, and keyframes are visible to every other `.arv` file in the project — that is how `color.primary` resolves inside `button.arv` without an import statement. If you omit the option, the plugin looks for `src/theme.arv` by convention and uses it when present. TypeScript Component prop types come from the TypeScript plugin, which serves type declarations for `.arv` imports virtually — no generated files on disk. Add it to your tsconfig and use `arvia-tsc` (a thin wrapper around tsc that loads the plugin) for command-line type checking. tsconfig.json {\n  "compilerOptions": {\n    "plugins": [{ "name": "@arviahq/typescript-plugin" }]\n  }\n} package.json {\n  "scripts": {\n    "typecheck": "arvia-tsc --noEmit"\n  }\n} In Vue projects, the `arvia-tsc` shipped by @arviahq/vite-plugin-vue is Vue-aware — it loads the Vue language plugin alongside Arvia\'s, so `.arv` imports inside `.vue` single-file components typecheck; use it in place of vue-tsc. As a fallback for setups where the plugin cannot run, arvia({ dts: true }) writes sibling `.d.ts` files next to each `.arv` file instead — but prefer the plugin, since sibling files shadow the virtual types and add noise to your tree. Editor setup The language server gives you diagnostics, completion for tokens and variants, hover documentation, and go-to-definition in any LSP-capable editor: VS Code — install the [Arvia extension](https://marketplace.visualstudio.com/items?itemName=arviahq.arvia); it bundles syntax highlighting and starts the language server automatically. Zed — install the Arvia extension from the extension registry. Neovim — add the tree-sitter grammar for highlighting and point your LSP client at @arviahq/language-server (it speaks stdio). Troubleshooting Imports from `.arv` files are typed as any — the TypeScript plugin is not loaded. Editors use their own tsserver: in VS Code, run “TypeScript: Select TypeScript Version” and pick the workspace version so tsconfig plugins apply. Tokens from your theme are reported as unknown (ARV101) in other files — the theme file is not being picked up. Check the theme path in `vite.config.ts`, or move the file to the conventional `src/theme.arv` location. In a monorepo, theme paths resolve relative to the Vite root of each app — every app declares its own theme option, even when they share one theme file.',
};

export function InstallationPage() {
  return (
    <DocArticle meta={installationMeta}>
      <DocP>
        <fbt desc="Docs content — install: overview">
          {
            "Arvia integrates through a Vite plugin that compiles `.arv` imports on the fly. Pick the package that matches your framework — the compiler underneath is identical, only the surrounding JSX tooling differs."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — React">{"React"}</fbt>
      </DocH2>
      <DocCode label={"terminal"} code={`npm install -D @arviahq/vite-plugin-react`} />
      <DocCode
        label={"vite.config.ts"}
        code={`import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    react(),
  ],
});`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — plugin order">
          {
            "The arvia() plugin must come before the framework plugin so `.arv` imports are compiled before JSX transformation touches them."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — Preact">{"Preact"}</fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact`}
      />
      <DocCode
        label={"vite.config.ts"}
        code={`import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { arvia } from "@arviahq/vite-plugin-preact";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    preact(),
  ],
});`}
      />
      <DocH2>
        <fbt desc="Docs content — Vue">{"Vue"}</fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`npm install -D @arviahq/vite-plugin-vue @vitejs/plugin-vue vue`}
      />
      <DocCode
        label={"vite.config.ts"}
        code={`import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { arvia } from "@arviahq/vite-plugin-vue";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    vue(),
  ],
});`}
      />
      <DocCode
        label={"App.vue"}
        code={`<script setup lang="ts">
import { Button } from "./button.arv";

const styles = Button({ size: "lg", tone: "primary" });
</script>

<template>
  <button :class="styles.root">Save</button>
</template>`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: theme option">{"The theme option"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — install: theme option semantics">
          {
            "The theme option names one shared theme file whose tokens, recipes, and keyframes are visible to every other `.arv` file in the project — that is how `color.primary` resolves inside `button.arv` without an import statement. If you omit the option, the plugin looks for `src/theme.arv` by convention and uses it when present."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — TypeScript">{"TypeScript"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — install: typescript plugin">
          {
            "Component prop types come from the TypeScript plugin, which serves type declarations for `.arv` imports virtually — no generated files on disk. Add it to your tsconfig and use `arvia-tsc` (a thin wrapper around tsc that loads the plugin) for command-line type checking."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"tsconfig.json"}
        code={`{
  "compilerOptions": {
    "plugins": [{ "name": "@arviahq/typescript-plugin" }]
  }
}`}
      />
      <DocCode
        label={"package.json"}
        code={`{
  "scripts": {
    "typecheck": "arvia-tsc --noEmit"
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — install: vue-aware arvia-tsc and dts fallback">
          {
            "In Vue projects, the `arvia-tsc` shipped by @arviahq/vite-plugin-vue is Vue-aware — it loads the Vue language plugin alongside Arvia's, so `.arv` imports inside `.vue` single-file components typecheck; use it in place of vue-tsc. As a fallback for setups where the plugin cannot run, arvia({ dts: true }) writes sibling `.d.ts` files next to each `.arv` file instead — but prefer the plugin, since sibling files shadow the virtual types and add noise to your tree."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: editor setup">{"Editor setup"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — install: editor lead-in">
          {
            "The language server gives you diagnostics, completion for tokens and variants, hover documentation, and go-to-definition in any LSP-capable editor:"
          }
        </fbt>
      </DocP>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — vscode setup">
            {
              "VS Code — install the [Arvia extension](https://marketplace.visualstudio.com/items?itemName=arviahq.arvia); it bundles syntax highlighting and starts the language server automatically."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — zed setup">
            {"Zed — install the Arvia extension from the extension registry."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — neovim setup">
            {
              "Neovim — add the tree-sitter grammar for highlighting and point your LSP client at @arviahq/language-server (it speaks stdio)."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: troubleshooting">{"Troubleshooting"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — troubleshoot any types">
            {
              "Imports from `.arv` files are typed as any — the TypeScript plugin is not loaded. Editors use their own tsserver: in VS Code, run “TypeScript: Select TypeScript Version” and pick the workspace version so tsconfig plugins apply."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — troubleshoot theme not found">
            {
              "Tokens from your theme are reported as unknown (ARV101) in other files — the theme file is not being picked up. Check the theme path in `vite.config.ts`, or move the file to the conventional `src/theme.arv` location."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — troubleshoot monorepo">
            {
              "In a monorepo, theme paths resolve relative to the Vite root of each app — every app declares its own theme option, even when they share one theme file."
            }
          </fbt>
        </DocLi>
      </DocUl>
    </DocArticle>
  );
}
