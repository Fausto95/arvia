# @arviahq/typescript-plugin

TypeScript integration for `.arv` files with **no generated `.d.ts` files**:
each `.arv` file is presented to TypeScript as an in-memory virtual module
containing its generated declarations (the vue-tsc / Volar pattern).

Types depend only on component, slot and variant _names_ — never on token
values or recipes — so this works without the theme file and without semantic
checking. Style errors still surface through `@arviahq/vite-plugin`.

## Editor types

Either of:

1. **VS Code + Arvia extension** — the extension contributes this package as a
   tsserver plugin automatically.
2. **Any editor (workspace TypeScript)** — add to `tsconfig.json`:

   ```jsonc
   { "compilerOptions": { "plugins": [{ "name": "@arviahq/typescript-plugin" }] } }
   ```

## CLI typechecking

`arvia-tsc` is a drop-in replacement for `tsc`:

```bash
arvia-tsc --noEmit
arvia-tsc -p tsconfig.json --watch
```

## Notes

- Stale `*.arv.d.ts` files on disk shadow the virtual types — delete them
  when migrating from `arvia gen` (the sibling-file fallback, still available
  via `arvia gen` or `arvia({ dts: true })` in the Vite plugin).
- Editors must use the workspace TypeScript version for tsconfig-based plugin
  loading; the VS Code extension path works with the bundled TS as well.
