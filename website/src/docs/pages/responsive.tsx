import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const responsiveMeta: DocPageMeta = {
  slug: "responsive",
  title: <fbt desc="Docs page title — Responsive">{"Responsive"}</fbt>,
  description: (
    <fbt desc="Docs page description — Switch variants by breakpoint.">
      {"Change a variant's value at a breakpoint."}
    </fbt>
  ),
  nav: { section: "language", order: 11 },
  searchText:
    'First define breakpoint tokens in the theme: breakpoint { md = 768px; }. Then a responsive block switches a variant value at a breakpoint. component Button { variants { size { sm {} lg {} } } defaults { size: sm; } responsive { md { size: lg; } } } The button is sm by default and becomes lg once the viewport passes the md breakpoint. You can also switch from the call site with the object form: Button({ size: { initial: "sm", md: "lg" } }). Related: Variants, Container queries.',
};

export function ResponsivePage() {
  return (
    <DocArticle meta={responsiveMeta}>
      <DocP>
        <fbt desc="Docs content — responsive: tokens">
          {"First define breakpoint tokens in the theme:"}
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  breakpoint { md = 768px; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — responsive: what">
          {"Then a `responsive` block switches a variant's value at a breakpoint:"}
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  variants { size { sm {} lg {} } }
  defaults { size: sm; }

  responsive {
    md { size: lg; }
  }
}`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — responsive: call site">
          {
            'You can also switch from the call site with the object form: `Button({ size: { initial: "sm", md: "lg" } })` — per-instance control, fully typed.'
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — responsive: related">
          {"[Variants & defaults](/docs/variants) · [Container queries](/docs/container-queries)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
