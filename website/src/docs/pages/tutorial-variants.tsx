import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";
import { BUTTON_VARIANTS_SOURCE } from "./tutorial-snippets";

export const tutorial_variantsMeta: DocPageMeta = {
  slug: "tutorial-variants",
  title: <fbt desc="Docs page title — Tutorial variants">{"3. Add variants"}</fbt>,
  description: (
    <fbt desc="Docs page description — Add tone and size variants.">
      {"Give the button tone and size options with typed props."}
    </fbt>
  ),
  nav: { section: "tutorial", order: 3 },
  searchText:
    'A variant is a named axis of choices. Add a variants block with tone and size, and a defaults block for the value used when the caller passes nothing. variants { tone { primary { background: color.primary; } neutral { background: color.muted; } } size { sm { padding: space.1 space.3; font-size: font.sm; } md { padding: space.2 space.4; font-size: font.md; } } } defaults { tone: primary; size: md; } The function now takes typed props. const a = Button(); const b = Button({ tone: "neutral", size: "sm" }); Passing an unknown value is a TypeScript error. Next: slots.',
};

export function TutorialVariantsPage() {
  return (
    <DocArticle meta={tutorial_variantsMeta}>
      <DocP>
        <fbt desc="Docs content — tut-variants: intro">
          {
            "A variant is a named axis of choices — like `tone` or `size`. Add a `variants` block, and a `defaults` block for the value used when the caller passes nothing:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`component Button {
  base {
    display: inline-flex;
    align-items: center;
    border: none;
    border-radius: radius.md;
    color: white;
    cursor: pointer;
  }

  variants {
    tone {
      primary { background: color.primary; }
      neutral { background: color.muted; }
    }
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      md { padding: space.2 space.4; font-size: font.md; }
    }
  }

  defaults { tone: primary; size: md; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — tut-variants: usage">
          {"The function now takes typed props — your editor autocompletes every value:"}
        </fbt>
      </DocP>
      <DocCode
        label={"src/App.tsx"}
        code={`const a = Button();                          // primary, md
const b = Button({ tone: "neutral", size: "sm" });`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — tut-variants: typed">
          {
            'Passing a value that doesn\'t exist — `Button({ tone: "ghost" })` — is a TypeScript error, caught before you run anything.'
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: try it">{"Try it"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — tut-variants: playground lead">
          {"The preview shows both tones. Add a third tone and it appears automatically:"}
        </fbt>
      </DocP>
      <DocPlayground source={BUTTON_VARIANTS_SOURCE} />
      <DocP>
        <fbt desc="Docs content — tut-variants: next">
          {"Next: [multi-part components with slots](/docs/tutorial-slots)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
