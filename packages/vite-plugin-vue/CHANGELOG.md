# @arviahq/vite-plugin-vue

## 0.6.1

### Patch Changes

- Updated dependencies [fb38c22]
  - @arviahq/vite-plugin@0.6.1
  - @arviahq/typescript-plugin@0.6.1

## 0.6.0

### Minor Changes

- 15ca346: Emit `.d.ts` files by default so consumers can typecheck `.arv` imports with plain `tsc` — no `arvia-tsc`, no tsserver plugin.

  `dts` now defaults to `"central"`: declarations are mirrored into `.arvia/types` (e.g. `src/components/stack.arv` → `.arvia/types/components/stack.arv.d.ts`), updated on save and at build with stale mirrors pruned. The plugin drops a self-ignoring `.gitignore` into that folder, so generated files are never committed and no root `.gitignore` change is needed. Consumers add `"rootDirs": ["src", ".arvia/types"]` to their tsconfig (with `moduleResolution: "bundler"`) and run plain `tsc --noEmit`; `arvia gen` (now also central by default) materializes the tree in CI.

  Set `dts: false` to opt out and keep the file-less `@arviahq/typescript-plugin` path, or `dts: true` / `"sibling"` to write `foo.arv.d.ts` next to each source file.

### Patch Changes

- Updated dependencies [15ca346]
  - @arviahq/vite-plugin@0.6.0
  - @arviahq/typescript-plugin@0.6.0

## 0.5.1

### Patch Changes

- b17ffdb: Update repository metadata for the GitHub org transfer to [arviahq/arvia](https://github.com/arviahq/arvia).
- Updated dependencies [b17ffdb]
  - @arviahq/vite-plugin@0.5.1
  - @arviahq/typescript-plugin@0.5.1

## 0.5.0

### Minor Changes

- ebc412f: Add `@arviahq/vite-plugin-vue`, the Vue + Vite entrypoint for Arvia. Its `arvia-tsc` is Vue-aware: a new `@arviahq/typescript-plugin/vue-cli` entry loads the Vue language plugin alongside Arvia's, so `.arv` imports inside `.vue` single-file components typecheck with no on-disk `.d.ts` files — use it in place of `vue-tsc`.

### Patch Changes

- Updated dependencies [ebc412f]
  - @arviahq/typescript-plugin@0.5.0
  - @arviahq/vite-plugin@0.5.0
