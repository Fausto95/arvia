import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const stylesMeta: DocPageMeta = {
  slug: "styles",
  title: <fbt desc="Docs page title — Styles">{"Styles"}</fbt>,
  description: (
    <fbt desc="Docs page description — Standalone utility classes.">
      {"One-off utility classes, exported as plain strings."}
    </fbt>
  ),
  nav: { section: "language", order: 4 },
  searchText:
    'A style compiles to exactly one CSS class and exports its name as a string — the right tool for utilities. style truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } import { truncate } from "./utils.arv"; <p className={truncate}>A long line…</p> truncate is just a string. A style supports declarations, token references, use, and &-states — but no variants or slots. The moment you need a second flavor or a second element, graduate to a component. Style names must be valid identifiers and unique in the file. Related: Recipes, Components.',
};

export function StylesPage() {
  return (
    <DocArticle meta={stylesMeta}>
      <DocP>
        <fbt desc="Docs content — styles: what">
          {
            "A `style` compiles to exactly one CSS class and exports its name as a plain string — the right tool for one-off utilities:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/utils.arv"}
        code={`style truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`}
      />
      <DocCode
        label={"App.tsx"}
        code={`import { truncate } from "./utils.arv";

<p className={truncate}>A very long line that should ellipsize…</p>;`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — styles: graduate">
          {
            "A `style` supports declarations, token references, `use`, and `&`-states — but no variants or slots. The moment you need a second flavor or element, graduate to a [component](/docs/components). Names must be valid identifiers and unique in the file."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — styles: related">
          {"[Recipes](/docs/recipes) for fragments you compose · [Components](/docs/components)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
