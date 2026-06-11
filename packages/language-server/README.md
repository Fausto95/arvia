# @arviahq/language-server

Language Server Protocol implementation for `.arv` files.

## Features

- **Diagnostics** — Arvia compiler errors and warnings with source spans
- **Completion** — section keywords, theme tokens, recipes, CSS properties
- **Hover** — resolved token values from the workspace theme file

## Usage

The VS Code extension (`arvia-vscode`) starts this server automatically.

Standalone:

```bash
arvia-language-server --stdio
```

Configure any LSP client with `languageId: arvia` and the server command above.

## Workspace theme

The server loads `src/theme.arv` from the workspace root (nearest `package.json`)
and injects its token environment when checking component files.
