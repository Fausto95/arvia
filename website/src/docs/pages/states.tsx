import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const statesMeta: DocPageMeta = {
  slug: "states",
  title: <fbt desc="Docs page title — States">{"States"}</fbt>,
  description: (
    <fbt desc="Docs page description — Hover, focus, and more.">
      {"Style hover, focus, active, and other states with &."}
    </fbt>
  ),
  nav: { section: "language", order: 10 },
  searchText:
    'Style interaction states with & followed by a pseudo-class, nested inside the block. component Button { base { background: color.primary; &:hover { filter: brightness(1.05); } &:active { transform: translateY(1px); } &:disabled { opacity: 0.5; } } } The & is the element the styles are on. You can also use attribute selectors (&[data-open="true"]) and combinators (& > svg). To restyle a slot when the root is hovered, nest the slot inside the state: &:hover { icon { transform: translateX(2px); } } — that compiles to a descendant selector (group hover). Related: Slots, Variants.',
};

export function StatesPage() {
  return (
    <DocArticle meta={statesMeta}>
      <DocP>
        <fbt desc="Docs content — states: what">
          {
            "Style interaction states with `&` followed by a pseudo-class, nested right inside the block. `&` is the element the styles sit on:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  base {
    background: color.primary;

    &:hover { filter: brightness(1.05); }
    &:active { transform: translateY(1px); }
    &:disabled { opacity: 0.5; }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — states: selectors">
          {
            'The same `&` works with attribute selectors (`&[data-open="true"]`) and combinators (`& > svg`).'
          }
        </fbt>
      </DocP>
      <DocCallout tone="tip">
        <fbt desc="Docs note — states: group hover">
          {
            "To restyle a [slot](/docs/slots) when the root is hovered, nest the slot inside the state: `&:hover { icon { transform: translateX(2px); } }`. That compiles to a descendant selector — group hover, for free."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — states: related">
          {"[Slots](/docs/slots) · [Variants & defaults](/docs/variants)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
