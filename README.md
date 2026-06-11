<p align="center">
  <img src="assets/banner.svg" alt="Arvia — the design system compiler" width="100%" />
</p>

# Arvia

**A framework-agnostic design system compiler.**

Write `.arv` files — themes, tokens, recipes, components — and compile them to optimized CSS and typed TypeScript APIs. Zero runtime styling cost.

```tsx
import { Button } from "./button.arv";

const styles = Button({ size: "lg", tone: "danger" });
<button className={styles.root}>Delete</button>;
```

```arv
component Button {
  variants {
    size { sm {} lg {} }
    tone { primary { background: color.primary; } danger { background: color.danger; } }
  }
  defaults { size: sm; tone: primary; }
}
```

## Documentation

The full language reference, tooling guides, and interactive playground live in the docs site:

```bash
pnpm install
pnpm website
```

Then open [localhost:5173](http://localhost:5173) — start at **Docs → Introduction** or try the **Playground**.

## Install

Arvia ships framework-specific Vite entrypoints. Pick React or Preact:

### React

```bash
npm install -D @arviahq/vite-plugin-react
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" }), react()],
});
```

### Preact

```bash
npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { arvia } from "@arviahq/vite-plugin-preact";

export default defineConfig({
  plugins: [arvia({ theme: "src/theme.arv" }), preact()],
});
```

See **Docs → Quick start** in the site for the full setup.

## VS Code extension

Syntax highlighting, diagnostics, completion, and hover for `.arv` files. The packaged extension ships in this repo at [`packages/vscode-extension/arvia.vsix`](./packages/vscode-extension/arvia.vsix):

```bash
code --install-extension packages/vscode-extension/arvia.vsix
```

Or in VS Code: **Extensions → ⋯ → Install from VSIX…** Works in Cursor and other VS Code forks too.

## Packages

| Package                                                  | Install? | Purpose                                             |
| -------------------------------------------------------- | -------- | --------------------------------------------------- |
| `@arviahq/vite-plugin-react`                             | **yes**  | React + Vite entrypoint (plugin, CLI, TypeScript)   |
| `@arviahq/vite-plugin-preact`                            | **yes**  | Preact + Vite entrypoint (plugin, CLI, TypeScript)  |
| `@arviahq/compiler`                                      |          | Core compiler                                       |
| `@arviahq/language-server`                               |          | LSP for `.arv` files                                |
| `@arviahq/storybook`                                     |          | Storybook story generator                           |
| `@arviahq/docs`                                          |          | Token catalog generator                             |
| [`arvia` VS Code extension](./packages/vscode-extension) | vsix     | Syntax highlighting, diagnostics, completion, hover |

## Development

```bash
pnpm install
pnpm build
pnpm test
```

Contributors: [`examples/demo`](./examples/demo) for a local playground, [`PUBLISHING.md`](./PUBLISHING.md) for releases.

## License

MIT
