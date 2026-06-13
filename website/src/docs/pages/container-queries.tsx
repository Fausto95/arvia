import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const container_queriesMeta: DocPageMeta = {
  slug: "container-queries",
  title: <fbt desc="Docs page title — Container queries">{"Container queries"}</fbt>,
  description: (
    <fbt desc="Docs page description — Adapt to container width.">
      {"Switch variants based on the component's own width."}
    </fbt>
  ),
  nav: { section: "language", order: 12 },
  searchText:
    "Container queries adapt a component to its own width, not the viewport's. Define container tokens in the theme: container { wide = 480px; }. Then a container block switches a variant when the component is at least that wide. component Card { variants { layout { stacked { flex-direction: column; } row { flex-direction: row; } } } defaults { layout: stacked; } container { wide { layout: row; } } } The card stacks by default and switches to a row once its container is at least 480px — so the same card adapts in a sidebar and in a full-width region. Arvia sets container-type on the root for you. Related: Responsive, Variants.",
};

export function ContainerQueriesPage() {
  return (
    <DocArticle meta={container_queriesMeta}>
      <DocP>
        <fbt desc="Docs content — container: what">
          {
            "Container queries adapt a component to its own width, not the viewport's. Define container tokens in the theme, then a `container` block switches a variant when the component is at least that wide:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"card.arv"}
        code={`component Card {
  variants {
    layout {
      stacked { flex-direction: column; }
      row { flex-direction: row; }
    }
  }
  defaults { layout: stacked; }

  container {
    wide { layout: row; }
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — container: same component">
          {
            "The card stacks by default and becomes a row once its container reaches the `wide` token width — so the same card adapts in a narrow sidebar and a full-width region. Arvia sets `container-type` on the root for you."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — container: related">
          {
            "[Responsive](/docs/responsive) for viewport breakpoints · [Variants & defaults](/docs/variants)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
