# @arviahq/vite-plugin-react

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

### Patch Changes

- Updated dependencies [ebc412f]
  - @arviahq/typescript-plugin@0.5.0
  - @arviahq/vite-plugin@0.5.0

## 0.4.0

### Patch Changes

- @arviahq/typescript-plugin@0.4.0
- @arviahq/vite-plugin@0.4.0

## 0.3.0

### Patch Changes

- @arviahq/vite-plugin@0.3.0
- @arviahq/typescript-plugin@0.3.0

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
  - @arviahq/vite-plugin@0.2.0
  - @arviahq/typescript-plugin@0.2.0
