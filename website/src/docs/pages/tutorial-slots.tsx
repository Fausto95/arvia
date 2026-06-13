import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";
import { CARD_SLOTS_SOURCE } from "./tutorial-snippets";

export const tutorial_slotsMeta: DocPageMeta = {
  slug: "tutorial-slots",
  title: <fbt desc="Docs page title — Tutorial slots">{"4. Slots"}</fbt>,
  description: (
    <fbt desc="Docs page description — Build a multi-part Card.">
      {"Style a component made of several elements with slots."}
    </fbt>
  ),
  nav: { section: "tutorial", order: 4 },
  searchText:
    "Some components have several parts. Slots let one component style each part. Declare them in a slots block, then style each by name inside base. component Card { slots { root {} avatar {} name {} role {} } base { display: flex; align-items: center; gap: space.4; padding: space.4; background: color.surface; border: 1px solid color.border; border-radius: radius.md; avatar { width: 48px; height: 48px; border-radius: radius.full; background: color.primary; } name { font-size: font.lg; color: color.text; } role { font-size: font.sm; color: color.muted; } } } The function returns one class name per slot. const s = Card(); <div className={s.root}><div className={s.avatar} /><div><div className={s.name}>Ada</div><div className={s.role}>Engineer</div></div></div> root is always present; you put each slot class on the matching element. Next: states and responsive.",
};

export function TutorialSlotsPage() {
  return (
    <DocArticle meta={tutorial_slotsMeta}>
      <DocP>
        <fbt desc="Docs content — tut-slots: intro">
          {
            "Our card has several parts — an avatar, a name, a role. `slots` let one component style each part. Declare them, then style each by name inside `base`:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/card.arv"}
        code={`component Card {
  slots { root {} avatar {} name {} role {} }

  base {
    display: flex;
    align-items: center;
    gap: space.4;
    padding: space.4;
    background: color.surface;
    border: 1px solid color.border;
    border-radius: radius.md;

    avatar {
      width: 48px;
      height: 48px;
      border-radius: radius.full;
      background: color.primary;
    }
    name { font-size: font.lg; color: color.text; }
    role { font-size: font.sm; color: color.muted; }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — tut-slots: usage">
          {"The function returns one class name per slot. Put each on the matching element:"}
        </fbt>
      </DocP>
      <DocCode
        label={"src/App.tsx"}
        code={`import { Card } from "./card.arv";

const s = Card();

<div className={s.root}>
  <div className={s.avatar} />
  <div>
    <div className={s.name}>Ada Lovelace</div>
    <div className={s.role}>Engineer</div>
  </div>
</div>;`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — tut-slots: root">
          {
            "`root` is always there even if you don't declare it. The preview lays the slots out flat; in your own markup you nest them however you like."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: try it">{"Try it"}</fbt>
      </DocH2>
      <DocPlayground source={CARD_SLOTS_SOURCE} />
      <DocP>
        <fbt desc="Docs content — tut-slots: next">
          {"Next: [states and responsive](/docs/tutorial-states)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
