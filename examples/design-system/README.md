# Atomic Design Storybook Demo

A React + Storybook showcase for the Arvia design system compiler, organized by atomic design layers and including a **Language/** section that demonstrates every Arvia language construct.

## Quick start

From the monorepo root:

```bash
pnpm install
pnpm design-system:storybook
```

Storybook opens at [http://localhost:6006](http://localhost:6006).

## Project structure

```
src/
  theme.arv           # Shared tokens, modes, global styles, recipes, keyframes
  atoms/              # Primitives: Button, Badge, Text, Stack, Input, Avatar, Link, Divider
  molecules/          # Composed UI: Alert, FormField, Stat
  organisms/          # Patterns: SiteHeader, ProductCard, FeatureGrid, ConfirmPanel
  templates/          # Page layouts: PageShell, DashboardLayout
  language/           # One-feature-per-file language demos
  storybook/          # React render helpers for composed stories

stories/
  generated/          # Auto-generated CSF (regenerated on every storybook run — not committed)
  composed/           # Hand-written React composition stories (committed)
```

## Storybook sidebar

| Section        | Source                            | Authorship            |
| -------------- | --------------------------------- | --------------------- |
| **Atoms/**     | `src/atoms/*.arv`                 | Auto-generated        |
| **Language/**  | `src/language/*.arv`              | Auto-generated        |
| **Molecules/** | `src/molecules/*.arv` + renderers | Hand-written          |
| **Organisms/** | `src/organisms/*.arv` + renderers | Hand-written          |
| **Templates/** | `src/templates/*.arv` + renderers | Hand-written          |
| **Theme/**     | `src/theme.arv`                   | Hand-written overview |

## Regenerating stories

```bash
pnpm --filter design-system prestorybook
```

This runs:

```bash
arvia gen --storybook --out stories/generated --theme src/theme.arv --include atoms,language src
```

Only atoms and language demos are auto-generated. Molecules, organisms, and templates use hand-written stories in `stories/composed/` with realistic slot wiring via `src/storybook/renderers.tsx`.

## Language feature map

| Story                 | File                         | Arvia construct           |
| --------------------- | ---------------------------- | ------------------------- |
| Language/Tokens       | `language/tokens.arv`        | Token references          |
| Language/ImplicitRoot | `language/implicit-root.arv` | Implicit root slot        |
| Language/Slots        | `language/slots.arv`         | Named slots               |
| Language/Variants     | `language/variants.arv`      | Variants + defaults       |
| Language/Compound     | `language/compound.arv`      | Compound variants         |
| Language/States       | `language/states.arv`        | `&`-blocks                |
| Language/UseRecipe    | `language/use-recipe.arv`    | `use` recipe              |
| Language/RecipeNested | `language/recipe-nested.arv` | Nested recipes            |
| Language/Keyframes    | `language/keyframes.arv`     | Keyframe animations       |
| Language/StyleDecl    | `language/style-decl.arv`    | Standalone `style` export |
| Language/LocalTokens  | `language/local-tokens.arv`  | Component-scoped tokens   |
| Language/Responsive   | `language/responsive.arv`    | Breakpoint overrides      |
| Language/Container    | `language/container.arv`     | Container queries         |

Theme modes, global styles, and token `doc` strings are demonstrated in `src/theme.arv` and the **Theme/Overview** story.

## Scripts

| Command                                       | Description                        |
| --------------------------------------------- | ---------------------------------- |
| `pnpm design-system:storybook`                | Generate stories + start Storybook |
| `pnpm --filter design-system build-storybook` | Static Storybook build             |
| `pnpm --filter design-system typecheck`       | Typecheck with Arvia TS plugin     |
| `pnpm --filter design-system predocs`         | Generate token catalog             |
