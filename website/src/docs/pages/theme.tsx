import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const themeMeta: DocPageMeta = {
  slug: "theme",
  title: <fbt desc="Docs page title — Theme">{"Theme & tokens"}</fbt>,
  description: (
    <fbt desc="Docs page description — Design tokens.">
      {"Declare design tokens that every file references by name."}
    </fbt>
  ),
  nav: { section: "language", order: 0 },
  searchText:
    "A theme declares design tokens — named values grouped by kind. theme { color { primary = #635bff; text = #18181b; } space { 2 = 8px; 4 = 16px; } radius { md = 8px; } } Reference a token anywhere with group.name: background: color.primary; padding: space.4. Group names are yours to invent; token names can start with digits so scales like space.1, space.2 read naturally. The theme option in vite.config makes one theme file (by convention src/theme.arv) visible to every .arv file — no import needed. A token value can alias an earlier one: text = color.base. Single-value tokens are inlined into the CSS. Related: Theme modes, Local tokens, Token docs.",
};

export function ThemePage() {
  return (
    <DocArticle meta={themeMeta}>
      <DocP>
        <fbt desc="Docs content — theme: what">
          {
            "A `theme` declares design tokens — named values grouped by kind (color, space, radius, font, and any group you invent):"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  color {
    primary = #635bff;
    text = #18181b;
  }
  space { 2 = 8px; 4 = 16px; }
  radius { md = 8px; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — theme: reference">
          {
            "Reference any token with `group.name`, in any CSS value, with no import. Token names can start with digits, so scales like `space.2` read naturally:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  base {
    background: color.primary;
    padding: space.4;
    border-radius: radius.md;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — theme: alias">
          {"A token can alias an earlier one — useful for semantic names: `text = color.base`."}
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — theme: global">
          {
            'One theme file is shared across the project — set it with `arvia({ theme: "src/theme.arv" })`, or just name it `src/theme.arv` and it\'s picked up by convention. Single-value tokens are inlined into the CSS.'
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — theme: related">
          {
            "[Theme modes](/docs/theme-modes) for light/dark · [Local tokens](/docs/local-tokens) for component-scoped values · [Token docs](/docs/token-docs) to document tokens."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
