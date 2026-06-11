# Recipes

Short, one-feature-per-file examples. Each file lives under `src/recipes/` and uses the shared [`theme.arv`](../theme.arv).

| File                | Feature                                       |
| ------------------- | --------------------------------------------- |
| `tokens.arv`        | Token references (`color.primary`, `space.4`) |
| `implicit-root.arv` | Top-level decls → implicit `root` slot        |
| `slots.arv`         | Named slots                                   |
| `variants.arv`      | Variant axes + `defaults`                     |
| `compound.arv`      | `compound` multi-variant rules                |
| `states.arv`        | `&:hover`, `&:active`, `&:disabled`           |
| `use-recipe.arv`    | `use` recipe in a component                   |
| `recipe-nested.arv` | `use` inside recipes (`FocusRing`)            |
| `keyframes.arv`     | `keyframes` + animation refs                  |
| `style-decl.arv`    | `style` — standalone exported class           |
| `local-tokens.arv`  | component-scoped `tokens { }` shadowing       |
| `responsive.arv`    | `responsive {}` breakpoint overrides          |
| `container.arv`     | `container {}` query overrides                |

Theme modes, global styles, and token `doc` strings are demonstrated in [`theme.arv`](../theme.arv) and the playground theme toggle.

Run `pnpm demo` and open the **Recipes** tab.
