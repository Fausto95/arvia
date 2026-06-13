# @arviahq/vite-plugin-preact

The all-in-one Arvia package for Preact + Vite + TypeScript projects.

```bash
npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact
```

Includes:

- **Vite plugin** — `import { arvia } from "@arviahq/vite-plugin-preact"`
- **`arvia` CLI** — `arvia gen`, token docs, Storybook generation
- **`arvia-tsc`** — optional editor/typecheck integration (shim to `@arviahq/typescript-plugin`)

Example `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { arvia } from "@arviahq/vite-plugin-preact";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" }), preact()],
});
```

## Type checking

By default the plugin emits `.d.ts` declarations into `.arvia/types` (a
self-ignoring, generated folder), so you typecheck `.arv` imports with **plain
`tsc`**. Add a `rootDirs` overlay to your tsconfig:

```jsonc
{
  "compilerOptions": {
    "moduleResolution": "bundler", // Vite's default
    "rootDirs": ["src", ".arvia/types"],
  },
}
```

```jsonc
// package.json
{ "scripts": { "typecheck": "tsc --noEmit" } }
```

Run `arvia gen src` to materialize the declarations in CI before `tsc`. See
[`@arviahq/vite-plugin`](../vite-plugin/README.md#type-checking-with-plain-tsc-dts)
for the full `dts` reference (including `'sibling'` and opting out with `false`).

### Optional: file-less types via the TS plugin

Prefer zero generated files and always-fresh in-editor types? Set `dts: false`
and use the tsserver plugin + `arvia-tsc` instead:

```jsonc
// tsconfig.json
{ "compilerOptions": { "plugins": [{ "name": "@arviahq/typescript-plugin" }] } }
```

```jsonc
// package.json
{ "scripts": { "typecheck": "arvia-tsc --noEmit" } }
```

Lower-level packages (`@arviahq/vite-plugin`, `@arviahq/typescript-plugin`) are dependencies of this package and are not required for normal use.
