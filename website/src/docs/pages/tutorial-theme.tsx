import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";
import { THEME_SOURCE } from "./tutorial-snippets";

export const tutorial_themeMeta: DocPageMeta = {
  slug: "tutorial-theme",
  title: <fbt desc="Docs page title — Tutorial theme">{"1. Set up the theme"}</fbt>,
  description: (
    <fbt desc="Docs page description — Define design tokens.">
      {"Define the design tokens every component will reuse."}
    </fbt>
  ),
  nav: { section: "tutorial", order: 1 },
  searchText:
    'Start with a theme: named values, grouped, that the rest of your styles reference by name. Create src/theme.arv with color, space, radius, and font groups. theme { color { primary = #635bff; text = #1a1a2e; muted = #6b7280; surface = #ffffff; border = #e5e7eb; } space { 1 = 4px; 2 = 8px; 3 = 12px; 4 = 16px; } radius { md = 10px; full = 9999px; } font { sm = 13px; md = 15px; lg = 18px; } } Any .arv file can now write color.primary or space.4 — no import needed, because the theme option in vite.config makes the theme visible everywhere. Import the theme once in your entry file so its CSS ships: import "./theme.arv". Try it: edit a token in the playground and the surface updates. Next: your first component.',
};

export function TutorialThemePage() {
  return (
    <DocArticle meta={tutorial_themeMeta}>
      <DocP>
        <fbt desc="Docs content — tut-theme: intro">
          {
            "Everything starts with a theme: named values, grouped, that the rest of your styles reference by name. Create `src/theme.arv` with a few groups — colors, spacing, radii, and font sizes:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  color {
    primary = #635bff;
    text = #1a1a2e;
    muted = #6b7280;
    surface = #ffffff;
    border = #e5e7eb;
  }
  space { 1 = 4px; 2 = 8px; 3 = 12px; 4 = 16px; }
  radius { md = 10px; full = 9999px; }
  font { sm = 13px; md = 15px; lg = 18px; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — tut-theme: references">
          {
            "Any `.arv` file can now reference these as `color.primary` or `space.4` — with no import. The `theme` option in your Vite config makes the theme visible to every `.arv` file in the project."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — tut-theme: import once">
          {"Import the theme once in your entry file so its CSS and tokens ship:"}
        </fbt>
      </DocP>
      <DocCode label={"src/main.tsx"} code={`import "./theme.arv";`} />
      <DocH2>
        <fbt desc="Docs content — heading: try it">{"Try it"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — tut-theme: playground lead">
          {
            "Here's the theme with a small surface that uses the tokens. Change a color or a spacing value and watch the preview update:"
          }
        </fbt>
      </DocP>
      <DocPlayground source={THEME_SOURCE} />
      <DocCallout tone="info">
        <fbt desc="Docs note — tut-theme: single value">
          {
            "Tokens with a single value (like `space.4`) are inlined into the CSS. Tokens that change between light and dark become CSS variables — you'll see that in step 5."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — tut-theme: next">
          {"Next: [your first component](/docs/tutorial-button)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
