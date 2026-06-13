import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const slotsMeta: DocPageMeta = {
  slug: "slots",
  title: <fbt desc="Docs page title — Slots">{"Slots"}</fbt>,
  description: (
    <fbt desc="Docs page description — Multi-part components.">
      {"Give each part of a component its own class."}
    </fbt>
  ),
  nav: { section: "language", order: 6 },
  searchText:
    "When a component has several parts — an icon and a label, a header and a body — declare them as slots. Each gets its own generated class. component Button { slots { root {} icon {} label {} } base { display: inline-flex; align-items: center; gap: space.2; icon { flex-shrink: 0; } label { font-weight: 500; } } } Style a slot by nesting a block named after it. The function returns one class per slot. const s = Button(); <button className={s.root}><span className={s.icon}>★</span><span className={s.label}>Save</span></button>. root is always present; you choose which element gets each class, and you can skip a slot entirely. Related: Components, States, Compound variants.",
};

export function SlotsPage() {
  return (
    <DocArticle meta={slotsMeta}>
      <DocP>
        <fbt desc="Docs content — slots: what">
          {
            "When a component has several parts — an icon and a label, a header and a body — declare them as `slots`. Each gets its own generated class. Style a slot by nesting a block named after it:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`component Button {
  slots { root {} icon {} label {} }

  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    icon { flex-shrink: 0; }
    label { font-weight: 500; }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — slots: usage">
          {"The function returns one class per slot. Put each on the matching element:"}
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`const s = Button();

<button className={s.root}>
  <span className={s.icon}>★</span>
  <span className={s.label}>Save</span>
</button>;`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — slots: decoupled">
          {
            "`root` is always present. A slot is just a class — you choose which element gets it, and you can skip a slot entirely (an icon-less button never uses `s.icon`)."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: related">
          {
            "[Components](/docs/components) · [States](/docs/states) for cross-slot hover · [Compound variants](/docs/compound)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
