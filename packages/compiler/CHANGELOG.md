# @arviahq/compiler

## 0.5.0

### Minor Changes

- 548b081: Stricter checking, a formatter, and a second wave of IDE features.

  **Compiler**
  - CSS validation in the checker (css-tree/mdn-data): ARV180 unknown property with did-you-mean quick fix, ARV181 value-syntax mismatch — both warnings, `css: false | 'names' | 'syntax'` to opt down. Values containing `var()`/`env()` or unresolved token refs are never judged.
  - Unused-code warnings: ARV171 unused component token, ARV172 unused file-local recipe (suppressed for the shared theme via the new `sharedEnvFile` option), ARV173 empty variant.
  - `formatArv`: canonical token-stream formatter that preserves comments and the source's single-line/multiline block decisions, and fails closed on any discrepancy.
  - Rule-level CSS source maps (`CompileResult.cssMap`), served through the vite plugin for devtools jump-to-source; `buildIR`/`emitCss` and the IR types are now public.

  **Language server**
  - Folding ranges, selection ranges, workspace symbols, document formatting, and semantic tokens (contextual slot/variant/token classification).
  - Compiled-CSS hover previews: hovering a component, slot, variant value, style, or keyframes name shows its generated CSS.
  - New browser-safe `@arviahq/language-server/browser` entry powering real completion, hovers, and color decorators in the website playground (no worker, no LSP transport).

  Also new (unpublished): a tree-sitter grammar (`packages/tree-sitter-arvia`) with Neovim setup docs, a Zed extension skeleton, and VS Code snippets in the `arvia` extension.

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

## 0.3.0

## 0.2.0

### Minor Changes

- cd2d964: First public release under the `@arviahq` scope.
  - Design system compiler for `.arv` files (tokens, recipes, components, styles)
  - Vite plugin with HMR and `arvia` CLI
  - TypeScript virtual types via `@arviahq/typescript-plugin`
  - Language Server for editor diagnostics, completion, hover, rename, and more
  - VS Code extension (`arviahq.arvia`)
