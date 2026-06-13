import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const keyframesMeta: DocPageMeta = {
  slug: "keyframes",
  title: <fbt desc="Docs page title — Keyframes">{"Keyframes"}</fbt>,
  description: (
    <fbt desc="Docs page description — Named animations.">
      {"Define animations and reference them by name."}
    </fbt>
  ),
  nav: { section: "language", order: 13 },
  searchText:
    "Define an animation with keyframes Name at the top level, using from/to or percentage steps. keyframes pulse { from { opacity: 1; } to { opacity: 0.45; } } Reference it from a component as keyframes.name, like a token. component Badge { base { animation: keyframes.pulse duration.fast; } } The name is hashed so two files can both define pulse without clashing. Steps can use tokens too. Put keyframes in your theme file to share them. Related: Theme, Components.",
};

export function KeyframesPage() {
  return (
    <DocArticle meta={keyframesMeta}>
      <DocP>
        <fbt desc="Docs content — keyframes: what">
          {
            "Define an animation with `keyframes Name` at the top level, using `from`/`to` or percentage steps:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`keyframes pulse {
  from { opacity: 1; }
  to { opacity: 0.45; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — keyframes: reference">
          {"Reference it from a component as `keyframes.name`, like a token:"}
        </fbt>
      </DocP>
      <DocCode
        label={"badge.arv"}
        code={`component Badge {
  base {
    animation: keyframes.pulse duration.fast;
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — keyframes: hashed">
          {
            "The name is hashed, so two files can both define `pulse` without clashing. Steps can reference tokens too. Put shared animations in your theme file."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — keyframes: related">
          {"[Theme & tokens](/docs/theme) · [Components](/docs/components)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
