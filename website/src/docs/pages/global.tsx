import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const globalMeta: DocPageMeta = {
  slug: "global",
  title: <fbt desc="Docs page title — Global styles">{"Global styles"}</fbt>,
  description: (
    <fbt desc="Docs page description — Document-level CSS.">
      {"Resets, body typography, and other document-level rules."}
    </fbt>
  ),
  nav: { section: "language", order: 2 },
  searchText:
    "A global block emits plain document-level CSS — resets, body styles, element defaults — and can reference tokens. global { * { box-sizing: border-box; } body { margin: 0; background: color.background; color: color.text; } } Global rules are not scoped: the selectors land in the stylesheet exactly as written. Put global in your theme file (or any .arv file) and import that file once in your entry so the rules ship. Related: Theme, Styles.",
};

export function GlobalPage() {
  return (
    <DocArticle meta={globalMeta}>
      <DocP>
        <fbt desc="Docs content — global: what">
          {
            "A `global` block emits plain document-level CSS — resets, body styles, element defaults — and can reference tokens:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`global {
  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: color.background;
    color: color.text;
  }
}`}
      />
      <DocCallout tone="warning">
        <fbt desc="Docs note — global: not scoped">
          {
            "Global rules are not scoped — the selectors land in the stylesheet as written. Keep them to resets and document defaults. Put `global` in your theme file and import that file once in your entry so the rules ship."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — global: related">
          {"[Theme & tokens](/docs/theme) · [Styles](/docs/styles) for scoped utility classes."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
