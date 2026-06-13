# @arviahq/vite-plugin

Framework-agnostic Vite plugin for `.arv` files: CSS + JS generation with HMR,
plus optional `.d.ts` emission. Most projects use a framework wrapper
(`@arviahq/vite-plugin-react`, `-vue`, `-preact`) instead of this package directly.

```ts
import { arvia } from "@arviahq/vite-plugin";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" })],
});
```

## Options

| Option  | Type                                             | Default                    | Description                                                       |
| ------- | ------------------------------------------------ | -------------------------- | ----------------------------------------------------------------- |
| `theme` | `string`                                         | `src/theme.arv` if present | Shared theme file whose tokens/recipes every `.arv` file can use. |
| `dts`   | `boolean \| 'sibling' \| 'central' \| DtsConfig` | `'central'`                | How to emit `.d.ts` declarations (see below).                     |

### Type checking with plain `tsc` (`dts`)

By default (`dts: 'central'`) the plugin emits real declarations so you can
typecheck `.arv` imports with **plain `tsc`** — no `arvia-tsc`, no `plugins`
entry. Declarations are mirrored into `.arvia/types`, e.g.
`src/components/stack.arv` → `.arvia/types/components/stack.arv.d.ts`, updated on
save and at build with stale mirrors pruned. The plugin drops a self-ignoring
`.gitignore` into that folder, so you never commit generated declarations and
don't touch your root `.gitignore`.

The one thing you add is a `rootDirs` overlay so `tsc` resolves `./*.arv` imports
against the mirror:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // Vite's default; see note below
    "rootDirs": ["src", ".arvia/types"],
  },
}
```

```jsonc
// package.json
{ "scripts": { "typecheck": "tsc --noEmit" } }
```

Other modes:

- **`'sibling'`** (or `true`) — writes `foo.arv.d.ts` next to each source file.
  Resolved by `tsc` with no `rootDirs`, at the cost of files in your `src` tree.
- **`false`** — writes nothing; types come from `@arviahq/typescript-plugin`
  (the tsserver plugin + `arvia-tsc`) instead.

`DtsConfig` (object form) customizes central mode:

```ts
arvia({
  dts: {
    mode: "central", // default when an object is given
    dir: ".arvia/types", // central directory, relative to the Vite root
    sourceRoot: "src", // mirrored source root; must match rootDirs[0]
  },
});
```

> **Resolution note.** Central/sibling `.d.ts` files are found via TypeScript's
> `.d.ts`-append, which applies under `moduleResolution: "bundler"` (Vite's
> default) and `node10`/classic. It does **not** apply under `node16`/`nodenext`
> — those consumers should keep `moduleResolution: "bundler"` or use the tsserver
> plugin instead.

### Generating declarations in CI (`arvia gen`)

The `arvia` CLI materializes declarations without running Vite — useful before a
CI `tsc` step:

```bash
arvia gen src            # writes .arvia/types/**, prunes stale mirrors
arvia gen src --clean    # wipe the central dir first for a hermetic regen
```

Flags: `--dts-mode central|sibling` (default `central`), `--dts-dir <dir>`
(default `.arvia/types`), `--src-root <dir>` (default `src`), `--clean`.
