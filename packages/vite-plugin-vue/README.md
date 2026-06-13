# @arviahq/vite-plugin-vue

The all-in-one Arvia package for Vue + Vite + TypeScript projects.

```bash
npm install -D @arviahq/vite-plugin-vue @vitejs/plugin-vue vue
```

Includes:

- **Vite plugin** — `import { arvia } from "@arviahq/vite-plugin-vue"`
- **`arvia` CLI** — `arvia gen`, token docs, Storybook generation
- **`arvia-tsc`** — Vue-aware typechecking (see below)
- **TypeScript plugin** — add to `tsconfig.json` (package name is `@arviahq/typescript-plugin`):

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@arviahq/typescript-plugin" }]
  }
}
```

Example `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { arvia } from "@arviahq/vite-plugin-vue";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" }), vue()],
});
```

## Vue-aware `arvia-tsc`

The `arvia-tsc` shipped by this package loads the Vue language plugin alongside Arvia's, so `.arv` imports inside `.vue` single-file components typecheck with no on-disk `.d.ts` files — use it in place of `vue-tsc`:

```json
{
  "scripts": {
    "typecheck": "arvia-tsc --noEmit"
  }
}
```

## Generated `.d.ts` files (`dts`)

The Vite plugin defaults to `dts: "central"`, writing `.arv` declarations into
`.arvia/types`. **Vue projects typically don't need this**: `arvia-tsc` supplies
`.arv` types directly (above), and plain `tsc` can't typecheck `.vue` files
anyway, so `.arvia/types` would go unused. To skip generating those files, set
`dts: false`:

```ts
arvia({ theme: "src/theme.arv", dts: false });
```

Use central mode only if you also import `.arv` from plain `.ts`/`.tsx` files and
want to resolve those with `tsc` — see
[`@arviahq/vite-plugin`](../vite-plugin/README.md#type-checking-with-plain-tsc-dts).

Lower-level packages (`@arviahq/vite-plugin`, `@arviahq/typescript-plugin`) are dependencies of this package and are not required for normal use.
