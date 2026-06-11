# @arviahq/vite-plugin-preact

The all-in-one Arvia package for Preact + Vite + TypeScript projects.

```bash
npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact
```

Includes:

- **Vite plugin** — `import { arvia } from "@arviahq/vite-plugin-preact"`
- **`arvia` CLI** — `arvia gen`, token docs, Storybook generation
- **`arvia-tsc`** — typecheck `.arv` imports without on-disk `.d.ts` files (shim to `@arviahq/typescript-plugin`)
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
import preact from "@preact/preset-vite";
import { arvia } from "@arviahq/vite-plugin-preact";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" }), preact()],
});
```

Lower-level packages (`@arviahq/vite-plugin`, `@arviahq/typescript-plugin`) are dependencies of this package and are not required for normal use.
