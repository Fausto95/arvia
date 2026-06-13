import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const token_docsMeta: DocPageMeta = {
  slug: "token-docs",
  title: <fbt desc="Docs page title — Token docs">{"Token docs"}</fbt>,
  description: (
    <fbt desc="Docs page description — Document your tokens.">
      {"Attach a description to a token — it follows it everywhere."}
    </fbt>
  ),
  nav: { section: "language", order: 14 },
  searchText:
    'Add a doc string to any token with the doc keyword after its value. theme { color { primary = #635bff doc "Brand primary — CTAs and links"; danger = #e5484d doc "Destructive actions"; } } The description shows up on hover in your editor wherever the token is referenced, and feeds the generated token catalog (arvia gen --docs). Document intent, not the value — say what a token is for. Related: Theme, the CLI token catalog.',
};

export function TokenDocsPage() {
  return (
    <DocArticle meta={token_docsMeta}>
      <DocP>
        <fbt desc="Docs content — token-docs: what">
          {"Add a description to any token with the `doc` keyword after its value:"}
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  color {
    primary = #635bff doc "Brand primary — CTAs and links";
    danger = #e5484d doc "Destructive actions";
  }
}`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — token-docs: where it shows">
          {
            "The description shows on hover in your editor wherever the token is referenced, and feeds the generated token catalog (`arvia gen --docs`). Document intent, not the value — say what a token is for."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — token-docs: related">
          {"[Theme & tokens](/docs/theme) · [CLI](/docs/cli) for generating a token catalog."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
