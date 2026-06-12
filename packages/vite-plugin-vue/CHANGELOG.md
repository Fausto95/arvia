# @arviahq/vite-plugin-vue

## 0.5.0

### Minor Changes

- ebc412f: Add `@arviahq/vite-plugin-vue`, the Vue + Vite entrypoint for Arvia. Its `arvia-tsc` is Vue-aware: a new `@arviahq/typescript-plugin/vue-cli` entry loads the Vue language plugin alongside Arvia's, so `.arv` imports inside `.vue` single-file components typecheck with no on-disk `.d.ts` files — use it in place of `vue-tsc`.

### Patch Changes

- Updated dependencies [ebc412f]
  - @arviahq/typescript-plugin@0.5.0
  - @arviahq/vite-plugin@0.5.0
