import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const local_tokensMeta: DocPageMeta = {
  slug: "local-tokens",
  title: <fbt desc="Docs page title — Local tokens">{"Local tokens"}</fbt>,
  description: (
    <fbt desc="Docs page description — Component-scoped values.">
      {"Values scoped to a single component."}
    </fbt>
  ),
  nav: { section: "language", order: 7 },
  searchText:
    "A component can declare its own tokens block — values available only inside that component. Use it for one-off measurements that don't belong in the shared theme. component Chip { tokens { space { pad = 6px; } } base { padding: space.pad space.2; } } Local tokens add to (or shadow) the theme by name, but only within this component. Everywhere else the theme value still wins. Keep design-system values in the theme; reach for local tokens only for genuinely component-specific numbers. Related: Theme, Components.",
};

export function LocalTokensPage() {
  return (
    <DocArticle meta={local_tokensMeta}>
      <DocP>
        <fbt desc="Docs content — local-tokens: what">
          {
            "A component can declare its own `tokens` block — values available only inside that component. Use it for one-off measurements that don't belong in the shared theme:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"chip.arv"}
        code={`component Chip {
  tokens {
    space { pad = 6px; }
  }

  base {
    padding: space.pad space.2;
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — local-tokens: shadow">
          {
            "Local tokens add to — or shadow — the theme by name, but only within this component. Everywhere else the theme value still wins. Keep design-system values in the [theme](/docs/theme); reach for local tokens only for genuinely component-specific numbers."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — local-tokens: related">
          {"[Theme & tokens](/docs/theme) · [Components](/docs/components)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
