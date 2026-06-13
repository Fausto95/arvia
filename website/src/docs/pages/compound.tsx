import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const compoundMeta: DocPageMeta = {
  slug: "compound",
  title: <fbt desc="Docs page title — Compound variants">{"Compound variants"}</fbt>,
  description: (
    <fbt desc="Docs page description — Styles for a combination.">
      {"Styles that apply only when several variants line up."}
    </fbt>
  ),
  nav: { section: "language", order: 9 },
  searchText:
    "Sometimes a style should apply only for a specific combination of variants — a small danger button, say. A compound block lists the matching values, then the styles to add. component Button { variants { size { sm {} lg {} } tone { primary {} danger {} } } defaults { size: sm; tone: primary; } compound { size: sm; tone: danger; root { font-weight: 700; text-transform: uppercase; } } } The styles apply only when every listed value matches (size sm AND tone danger). You can target slots inside a compound. Add more compound blocks for more combinations. Related: Variants, Slots.",
};

export function CompoundPage() {
  return (
    <DocArticle meta={compoundMeta}>
      <DocP>
        <fbt desc="Docs content — compound: what">
          {
            "Sometimes a style should apply only for a specific combination of variants — a small danger button, say. A `compound` block lists the values to match, then the styles to add:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  variants {
    size { sm {} lg {} }
    tone { primary {} danger {} }
  }
  defaults { size: sm; tone: primary; }

  compound {
    size: sm;
    tone: danger;

    root {
      font-weight: 700;
      text-transform: uppercase;
    }
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — compound: AND">
          {
            "The styles apply only when every listed value matches (size `sm` AND tone `danger`). Target a slot inside the compound, and add more `compound` blocks for more combinations."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — compound: related">
          {"[Variants & defaults](/docs/variants) · [Slots](/docs/slots)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
