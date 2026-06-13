import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const recipesMeta: DocPageMeta = {
  slug: "recipes",
  title: <fbt desc="Docs page title — Recipes">{"Recipes & use"}</fbt>,
  description: (
    <fbt desc="Docs page description — Reusable style fragments.">
      {"Reusable style fragments you pull in with use."}
    </fbt>
  ),
  nav: { section: "language", order: 3 },
  searchText:
    "A recipe is a named style fragment — declarations and states — that other rules pull in with use. It generates no CSS on its own. recipe FocusRing { outline: none; &:focus-visible { outline: 2px solid color.primary; outline-offset: 2px; } } component Button { base { background: color.primary; use FocusRing; } } use FocusRing flattens the recipe into the base block. Recipes can use other recipes. Define them in your theme file to share across the project, or in any .arv file for local reuse. Recipes have no variants or slots — for that, use a component. Related: Styles, Components.",
};

export function RecipesPage() {
  return (
    <DocArticle meta={recipesMeta}>
      <DocP>
        <fbt desc="Docs content — recipes: what">
          {
            "A `recipe` is a named style fragment — declarations and states — that other rules pull in with `use`. It generates no CSS on its own:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`recipe FocusRing {
  outline: none;
  &:focus-visible {
    outline: 2px solid color.primary;
    outline-offset: 2px;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — recipes: use">
          {"`use FocusRing` flattens the recipe's styles into the block that uses it:"}
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  base {
    background: color.primary;
    use FocusRing;
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — recipes: scope">
          {
            "Recipes can `use` other recipes. Define them in your theme file to share project-wide, or in any `.arv` file for local reuse. They have no variants or slots — reach for a [component](/docs/components) when you need those."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — recipes: related">
          {"[Styles](/docs/styles) · [Components](/docs/components)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
