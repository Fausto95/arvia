---
"@arviahq/compiler": minor
"@arviahq/language-server": minor
---

Stricter checking, a formatter, and a second wave of IDE features.

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
