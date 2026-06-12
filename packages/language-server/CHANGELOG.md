# @arviahq/language-server

## 0.4.0

### Minor Changes

- 446dd84: Stronger types and richer IDE support for `.arv` files.

  **Compiler**

  - Variants without a `defaults` entry now emit **required** props (`tone: "a" | "b"` instead of `tone?:`), and the component function requires its props object when any variant is required. The responsive/container object form of a required variant requires `initial`. Omitting a no-default variant silently rendered an unstyled element before — add a `defaults` entry to make a variant optional again.
  - Theme-bearing files now export a typed `tokens` object: `import { tokens } from "./theme.arv"` gives `var(--arvia-…)` references (literal-typed) for moded themes and resolved literal values for single-mode themes, plus per-group unions like `ColorToken`. A component or style named `tokens` in a theme-bearing file is now an error (ARV125).
  - Did-you-mean diagnostics carry structured fix data (`Diagnostic.fix`), exported as `DiagnosticFix`.

  **Language server**

  - Find references: tokens, recipes, keyframes, variants, values and slots — including cross-file fan-out through the shared theme from either direction.
  - Quick fixes: one-keystroke did-you-mean corrections, "insert defaults block" on components with required variants, and "remove unused slot" (with new hint-level lints anchoring the latter two).

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
