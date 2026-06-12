import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function installation(): DocSection {
  return {
    title: fbt("Installation", "Docs page title — Installation"),
    slug: "installation",
    description: fbt(
      "Add Arvia to a Vite project and set up your editor.",
      "Docs page description — Add Arvia to a Vite project and set up your editor.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Arvia integrates through a Vite plugin that compiles `.arv` imports on the fly. Pick the package that matches your framework — the compiler underneath is identical, only the surrounding JSX tooling differs.",
          "Docs content — install: overview",
        ),
      },
      { type: "h2", text: fbt("React", "Docs content — React") },
      {
        type: "code",
        label: "terminal",
        code: `npm install -D @arviahq/vite-plugin-react`,
      },
      {
        type: "code",
        label: "vite.config.ts",
        code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    react(),
  ],
});`,
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "The arvia() plugin must come before the framework plugin so `.arv` imports are compiled before JSX transformation touches them.",
          "Docs note — plugin order",
        ),
      },
      { type: "h2", text: fbt("Preact", "Docs content — Preact") },
      {
        type: "code",
        label: "terminal",
        code: `npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact`,
      },
      {
        type: "code",
        label: "vite.config.ts",
        code: `import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { arvia } from "@arviahq/vite-plugin-preact";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    preact(),
  ],
});`,
      },
      { type: "h2", text: fbt("Vue", "Docs content — Vue") },
      {
        type: "code",
        label: "terminal",
        code: `npm install -D @arviahq/vite-plugin-vue @vitejs/plugin-vue vue`,
      },
      {
        type: "code",
        label: "vite.config.ts",
        code: `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { arvia } from "@arviahq/vite-plugin-vue";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    vue(),
  ],
});`,
      },
      {
        type: "code",
        label: "App.vue",
        code: `<script setup lang="ts">
import { Button } from "./button.arv";

const styles = Button({ size: "lg", tone: "primary" });
</script>

<template>
  <button :class="styles.root">Save</button>
</template>`,
      },
      { type: "h2", text: fbt("The theme option", "Docs content — heading: theme option") },
      {
        type: "p",
        text: fbt(
          "The theme option names one shared theme file whose tokens, recipes, and keyframes are visible to every other `.arv` file in the project — that is how `color.primary` resolves inside `button.arv` without an import statement. If you omit the option, the plugin looks for `src/theme.arv` by convention and uses it when present.",
          "Docs content — install: theme option semantics",
        ),
      },
      { type: "h2", text: fbt("TypeScript", "Docs content — TypeScript") },
      {
        type: "p",
        text: fbt(
          "Component prop types come from the TypeScript plugin, which serves type declarations for `.arv` imports virtually — no generated files on disk. Add it to your tsconfig and use `arvia-tsc` (a thin wrapper around tsc that loads the plugin) for command-line type checking.",
          "Docs content — install: typescript plugin",
        ),
      },
      {
        type: "code",
        label: "tsconfig.json",
        code: `{
  "compilerOptions": {
    "plugins": [{ "name": "@arviahq/typescript-plugin" }]
  }
}`,
      },
      {
        type: "code",
        label: "package.json",
        code: `{
  "scripts": {
    "typecheck": "arvia-tsc --noEmit"
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "In Vue projects, the `arvia-tsc` shipped by @arviahq/vite-plugin-vue is Vue-aware — it loads the Vue language plugin alongside Arvia's, so `.arv` imports inside `.vue` single-file components typecheck; use it in place of vue-tsc. As a fallback for setups where the plugin cannot run, arvia({ dts: true }) writes sibling `.d.ts` files next to each `.arv` file instead — but prefer the plugin, since sibling files shadow the virtual types and add noise to your tree.",
          "Docs content — install: vue-aware arvia-tsc and dts fallback",
        ),
      },
      { type: "h2", text: fbt("Editor setup", "Docs content — heading: editor setup") },
      {
        type: "p",
        text: fbt(
          "The language server gives you diagnostics, completion for tokens and variants, hover documentation, and go-to-definition in any LSP-capable editor:",
          "Docs content — install: editor lead-in",
        ),
      },
      {
        type: "ul",
        items: [
          fbt(
            "VS Code — install the [Arvia extension](https://marketplace.visualstudio.com/items?itemName=arviahq.arvia); it bundles syntax highlighting and starts the language server automatically.",
            "Docs list item — vscode setup",
          ),
          fbt(
            "Zed — install the Arvia extension from the extension registry.",
            "Docs list item — zed setup",
          ),
          fbt(
            "Neovim — add the tree-sitter grammar for highlighting and point your LSP client at @arviahq/language-server (it speaks stdio).",
            "Docs list item — neovim setup",
          ),
        ],
      },
      { type: "h2", text: fbt("Troubleshooting", "Docs content — heading: troubleshooting") },
      {
        type: "ul",
        items: [
          fbt(
            "Imports from `.arv` files are typed as any — the TypeScript plugin is not loaded. Editors use their own tsserver: in VS Code, run “TypeScript: Select TypeScript Version” and pick the workspace version so tsconfig plugins apply.",
            "Docs list item — troubleshoot any types",
          ),
          fbt(
            "Tokens from your theme are reported as unknown (ARV101) in other files — the theme file is not being picked up. Check the theme path in `vite.config.ts`, or move the file to the conventional `src/theme.arv` location.",
            "Docs list item — troubleshoot theme not found",
          ),
          fbt(
            "In a monorepo, theme paths resolve relative to the Vite root of each app — every app declares its own theme option, even when they share one theme file.",
            "Docs list item — troubleshoot monorepo",
          ),
        ],
      },
    ],
  };
}
