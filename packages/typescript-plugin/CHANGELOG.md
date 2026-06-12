# @arviahq/typescript-plugin

## 0.5.0

### Minor Changes

- ebc412f: Add `@arviahq/vite-plugin-vue`, the Vue + Vite entrypoint for Arvia. Its `arvia-tsc` is Vue-aware: a new `@arviahq/typescript-plugin/vue-cli` entry loads the Vue language plugin alongside Arvia's, so `.arv` imports inside `.vue` single-file components typecheck with no on-disk `.d.ts` files — use it in place of `vue-tsc`.

### Patch Changes

- Updated dependencies [548b081]
  - @arviahq/compiler@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies [446dd84]
  - @arviahq/compiler@0.4.0

## 0.3.0

### Patch Changes

- @arviahq/compiler@0.3.0

## 0.2.0

### Minor Changes

- cd2d964: First public release under the `@arviahq` scope.
  - Design system compiler for `.arv` files (tokens, recipes, components, styles)
  - Vite plugin with HMR and `arvia` CLI
  - TypeScript virtual types via `@arviahq/typescript-plugin`
  - Language Server for editor diagnostics, completion, hover, rename, and more
  - VS Code extension (`arviahq.arvia`)

### Patch Changes

- Updated dependencies [cd2d964]
  - @arviahq/compiler@0.2.0
