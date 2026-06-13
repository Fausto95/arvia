---
"@arviahq/vite-plugin": minor
"@arviahq/vite-plugin-react": minor
"@arviahq/vite-plugin-preact": minor
"@arviahq/vite-plugin-vue": minor
---

Emit `.d.ts` files by default so consumers can typecheck `.arv` imports with plain `tsc` — no `arvia-tsc`, no tsserver plugin.

`dts` now defaults to `"central"`: declarations are mirrored into `.arvia/types` (e.g. `src/components/stack.arv` → `.arvia/types/components/stack.arv.d.ts`), updated on save and at build with stale mirrors pruned. The plugin drops a self-ignoring `.gitignore` into that folder, so generated files are never committed and no root `.gitignore` change is needed. Consumers add `"rootDirs": ["src", ".arvia/types"]` to their tsconfig (with `moduleResolution: "bundler"`) and run plain `tsc --noEmit`; `arvia gen` (now also central by default) materializes the tree in CI.

Set `dts: false` to opt out and keep the file-less `@arviahq/typescript-plugin` path, or `dts: true` / `"sibling"` to write `foo.arv.d.ts` next to each source file.
