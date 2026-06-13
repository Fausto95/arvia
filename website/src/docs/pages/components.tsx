import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const componentsMeta: DocPageMeta = {
  slug: "components",
  title: <fbt desc="Docs page title — Components">{"Components"}</fbt>,
  description: (
    <fbt desc="Docs page description — The core construct.">
      {"The core construct: styles under a name, exposed as a typed function."}
    </fbt>
  ),
  nav: { section: "language", order: 5 },
  searchText:
    'A component bundles styles under a name. The base block holds styles that always apply. component Button { base { padding: space.2 space.4; border-radius: radius.md; background: color.primary; color: white; } } Importing the file gives you a function. Calling it returns class names; you put them on your own markup. import { Button } from "./button.arv"; const s = Button(); <button className={s.root}>Save</button>. Every component has a root part; bare declarations at the top level (without the base keyword) style it. From here a component grows: variants for options, slots for multiple parts, states for hover and focus, responsive and container for adapting. Related: Variants, Slots, States.',
};

export function ComponentsPage() {
  return (
    <DocArticle meta={componentsMeta}>
      <DocP>
        <fbt desc="Docs content — components: what">
          {
            "A `component` bundles styles under a name. The `base` block holds styles that always apply:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`component Button {
  base {
    padding: space.2 space.4;
    border-radius: radius.md;
    background: color.primary;
    color: white;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — components: usage">
          {
            "Importing the file gives you a function. Call it to get class names for your own markup:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`import { Button } from "./button.arv";

const s = Button();
<button className={s.root}>Save</button>;`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — components: implicit root">
          {
            "Every component has a `root` part. Bare declarations written at the top level (without the `base` keyword) style it — `base` is just the explicit form."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: how it grows">{"How a component grows"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — components: grows">
          {
            "From here add [variants](/docs/variants) for options, [slots](/docs/slots) for multiple parts, [states](/docs/states) for hover and focus, and [responsive](/docs/responsive) / [container](/docs/container-queries) to adapt."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
