# Changelog

All notable changes to the `@arviahq/*` packages are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- First public release under the `@arviahq` npm scope.
- `@arviahq/vite-plugin-react` — React + Vite entrypoint with `arvia` CLI.
- `@arviahq/typescript-plugin` — virtual TypeScript types for `.arv` imports.
- `@arviahq/compiler` — `.arv` language compiler (CSS, JS, declarations).
- `@arviahq/language-server` — LSP (diagnostics, completion, hover, go-to-definition, rename, colors, inlay hints).
- VS Code extension **Arvia** (`arviahq.arvia`).
- `style {}` exported classes and component-scoped `tokens {}`.
- Theme modes, responsive variants, container queries, keyframes, compound variants.
- Storybook and token catalog generators via `arvia gen`.

### Changed

- Rebranded from Loom to Arvia (`.loom` → `.arv`).
- Renamed packages from `@arvia/*` to `@arviahq/*` ahead of npm publish.

## Prior history (monorepo)

Development began as **Loom** — a design-system compiler with `.loom` files, Vite HMR, and a Volar-based TypeScript plugin. Major milestones before the Arvia rebrand:

- V2: theme switching, responsive variants, LSP, Storybook integration
- V3: animations, container queries, token documentation
- Runtime removal: zero-runtime CSS output with `data-arvia-theme` mode switching
- LSP v3: AST-based navigation, rename, color decorators, CSS property docs

See `git log` for the full commit history.
