import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const recipesMeta: DocPageMeta = {
  slug: "recipes",
  title: <fbt desc="Docs page title — Recipes &amp;amp;amp; use">{"Recipes & use"}</fbt>,
  description: (
    <fbt desc="Docs page description — Reusable style fragments composed with use.">
      {"Reusable style fragments, and the use keyword that composes them — no imports required."}
    </fbt>
  ),
  nav: { section: "language", order: 8 },
  searchText:
    "A recipe is a named fragment of declarations that other styles pull in with use. Recipes are Arvia's composition primitive: they produce no CSS and no exports on their own — they only exist flattened into whatever consumes them. recipe FocusRing {\n  outline: none;\n  &:focus-visible {\n    outline: 2px solid color.primary;\n    outline-offset: 2px;\n  }\n}\n\ncomponent Button {\n  base {\n    use FocusRing;\n    padding: space.2 space.4;\n  }\n} Recipes hold declarations, `&-state` blocks, and `use` statements. They cannot declare variants, slots, or local tokens — a recipe is a fragment, not a component. If one grows in that direction, promote it. Implicit availability through the theme Recipes declared in your shared theme file are available to every `.arv` file in the project — `use FocusRing` simply works, with no import statement. This is the same ambient-environment mechanism that makes tokens global: the theme is compiled first, and its recipes ride along. src/theme.arv recipe Surface {\n  background: color.surface;\n  border: 1px solid color.border;\n  border-radius: radius.lg;\n} src/card.arv — no import needed component Card {\n  use Surface;\n  padding: space.5;\n} Recipes declared in any other file are local to that file. A local recipe that nothing uses earns a warning (ARV172) — in the shared theme file the warning is suppressed, since its consumers live elsewhere. Where use is allowed Location Example Component top level (targets root) component Card { use Surface; } Inside base base { use FocusRing; } Inside a slot block icon { use IconReset; } Inside a variant value danger { use LoudText; } Inside another recipe recipe Panel { use Surface; } Inside a style style panel { use Surface; } The one place use is not allowed is inside an `&-state` block — a recipe there would be ambiguous about which selector its own states attach to. Inline the declarations instead. Composition and ordering use is textual inclusion: the recipe's declarations are flattened in at exactly the spot the `use` statement sits. Within one rule, later declarations win — so you override a recipe by writing after it: recipe Rounded { border-radius: 8px; }\n\nrecipe Surface {\n  use Rounded;\n  border: 1px solid #e5e5e5;\n  background: white;\n}\n\ncomponent Card {\n  use Surface;\n  base {\n    padding: 16px;\n    background: #fafafa;   // wins over Surface's white — it comes later\n  }\n} generated CSS .Card_root_07xhee {\n  border-radius: 8px;       /* Rounded, via Surface */\n  border: 1px solid #e5e5e5;/* Surface */\n  background: white;        /* Surface */\n  padding: 16px;            /* Card */\n  background: #fafafa;      /* Card — last one wins */\n} Recipes nest to any depth, and the checker walks the chain: an unknown recipe is an error with a suggestion (ARV102), and a cycle — recipe A using B using A — is caught rather than looping forever (ARV103). State blocks flatten too: a recipe's `&:hover` merges with the consumer's other rules for the same selector. Building a recipe library Mature themes accumulate a small standard library of fragments. Good recipe candidates are cross-cutting and markup-free: src/theme.arv recipe FocusRing {\n  outline: none;\n  &:focus-visible {\n    outline: 2px solid color.primary;\n    outline-offset: 2px;\n  }\n}\n\nrecipe Interactive {\n  use FocusRing;\n  cursor: pointer;\n  transition: opacity duration.fast, filter duration.fast;\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n}\n\nrecipe Surface {\n  background: color.surface;\n  border: 1px solid color.border;\n  border-radius: radius.lg;\n} Note Interactive building on FocusRing: layered recipes let every button, link, and menu item in the system share one definition of “focusable, clickable thing” while each component keeps its own look. Recipe or style? Both hold the same kind of content; the difference is the consumer. A recipe is for other `.arv` code — it vanishes into its users and emits nothing. A style is for your markup — it emits one class and exports its name. When a fragment needs to be applied directly to an element somewhere, give it a style (which can itself use the recipe).",
};

export function RecipesPage() {
  return (
    <DocArticle meta={recipesMeta}>
      <DocP>
        <fbt desc="Docs content — recipes: opening">
          {
            "A recipe is a named fragment of declarations that other styles pull in with use. Recipes are Arvia's composition primitive: they produce no CSS and no exports on their own — they only exist flattened into whatever consumes them."
          }
        </fbt>
      </DocP>
      <DocCode
        code={`recipe FocusRing {
  outline: none;
  &:focus-visible {
    outline: 2px solid color.primary;
    outline-offset: 2px;
  }
}

component Button {
  base {
    use FocusRing;
    padding: space.2 space.4;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — recipes: what they hold">
          {
            "Recipes hold declarations, `&-state` blocks, and `use` statements. They cannot declare variants, slots, or local tokens — a recipe is a fragment, not a component. If one grows in that direction, promote it."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: implicit import">
          {"Implicit availability through the theme"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — recipes: theme env">
          {
            "Recipes declared in your shared theme file are available to every `.arv` file in the project — `use FocusRing` simply works, with no import statement. This is the same ambient-environment mechanism that makes tokens global: the theme is compiled first, and its recipes ride along."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`recipe Surface {
  background: color.surface;
  border: 1px solid color.border;
  border-radius: radius.lg;
}`}
      />
      <DocCode
        label={"src/card.arv — no import needed"}
        code={`component Card {
  use Surface;
  padding: space.5;
}`}
      />
      <DocP>
        <fbt desc="Docs content — recipes: locality and unused">
          {
            "Recipes declared in any other file are local to that file. A local recipe that nothing uses earns a warning (ARV172) — in the shared theme file the warning is suppressed, since its consumers live elsewhere."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: where use allowed">{"Where use is allowed"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="Docs table header — location">{"Location"}</fbt>,
          <fbt desc="Docs table header — example">{"Example"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — use component level">
              {"Component top level (targets root)"}
            </fbt>,
            "component Card { use Surface; }",
          ],
          [
            <fbt desc="Docs table cell — use in base">{"Inside base"}</fbt>,
            "base { use FocusRing; }",
          ],
          [
            <fbt desc="Docs table cell — use in slot">{"Inside a slot block"}</fbt>,
            "icon { use IconReset; }",
          ],
          [
            <fbt desc="Docs table cell — use in variant">{"Inside a variant value"}</fbt>,
            "danger { use LoudText; }",
          ],
          [
            <fbt desc="Docs table cell — use in recipe">{"Inside another recipe"}</fbt>,
            "recipe Panel { use Surface; }",
          ],
          [
            <fbt desc="Docs table cell — use in style">{"Inside a style"}</fbt>,
            "style panel { use Surface; }",
          ],
        ]}
      />
      <DocCallout tone="warning">
        <fbt desc="Docs note — recipes: no use in states">
          {
            "The one place use is not allowed is inside an `&-state` block — a recipe there would be ambiguous about which selector its own states attach to. Inline the declarations instead."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: composition ordering">{"Composition and ordering"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — recipes: ordering lead-in">
          {
            "use is textual inclusion: the recipe's declarations are flattened in at exactly the spot the `use` statement sits. Within one rule, later declarations win — so you override a recipe by writing after it:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`recipe Rounded { border-radius: 8px; }

recipe Surface {
  use Rounded;
  border: 1px solid #e5e5e5;
  background: white;
}

component Card {
  use Surface;
  base {
    padding: 16px;
    background: #fafafa;   // wins over Surface's white — it comes later
  }
}`}
      />
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`.Card_root_07xhee {
  border-radius: 8px;       /* Rounded, via Surface */
  border: 1px solid #e5e5e5;/* Surface */
  background: white;        /* Surface */
  padding: 16px;            /* Card */
  background: #fafafa;      /* Card — last one wins */
}`}
      />
      <DocP>
        <fbt desc="Docs content — recipes: nesting and checks">
          {
            "Recipes nest to any depth, and the checker walks the chain: an unknown recipe is an error with a suggestion (ARV102), and a cycle — recipe A using B using A — is caught rather than looping forever (ARV103). State blocks flatten too: a recipe's `&:hover` merges with the consumer's other rules for the same selector."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: recipe library">{"Building a recipe library"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — recipes: library lead-in">
          {
            "Mature themes accumulate a small standard library of fragments. Good recipe candidates are cross-cutting and markup-free:"
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
}

recipe Interactive {
  use FocusRing;
  cursor: pointer;
  transition: opacity duration.fast, filter duration.fast;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

recipe Surface {
  background: color.surface;
  border: 1px solid color.border;
  border-radius: radius.lg;
}`}
      />
      <DocP>
        <fbt desc="Docs content — recipes: layered library">
          {
            "Note Interactive building on FocusRing: layered recipes let every button, link, and menu item in the system share one definition of “focusable, clickable thing” while each component keeps its own look."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: recipe or style">{"Recipe or style?"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — recipes: vs style">
          {
            "Both hold the same kind of content; the difference is the consumer. A recipe is for other `.arv` code — it vanishes into its users and emits nothing. A style is for your markup — it emits one class and exports its name. When a fragment needs to be applied directly to an element somewhere, give it a style (which can itself use the recipe)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
