<p align="center">
  <img src="assets/banner.svg" alt="Arvia — the design system compiler for React" width="100%" />
</p>

# Arvia

**A design system compiler for React.**

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

See **Docs → Quick start** in the site for the full setup.

## Packages

| Package                      | Install? | Purpose                                  |
| ---------------------------- | -------- | ---------------------------------------- |
| `@arviahq/vite-plugin-react` | **yes**  | Vite plugin, CLI, TypeScript integration |
| `@arviahq/compiler`          |          | Core compiler                            |
| `@arviahq/language-server`   |          | LSP for `.arv` files                     |
| `@arviahq/storybook`         |          | Storybook story generator                |
| `@arviahq/docs`              |          | Token catalog generator                  |

## Development

```bash
pnpm install
pnpm build
pnpm test
```

Contributors: [`examples/demo`](./examples/demo) for a local playground, [`PUBLISHING.md`](./PUBLISHING.md) for releases.

## License

MIT
