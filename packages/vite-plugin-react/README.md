# @arviahq/vite-plugin-react

The all-in-one Arvia package for Vite + TypeScript projects.

```bash
npm install -D @arviahq/vite-plugin-react
```

Includes:

- **Vite plugin** — `import { arvia } from "@arviahq/vite-plugin-react"`
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

Lower-level packages (`@arviahq/vite-plugin`, `@arviahq/typescript-plugin`) are dependencies of this package and are not required for normal use.
