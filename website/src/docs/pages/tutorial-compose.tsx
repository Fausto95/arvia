import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";
import { PROFILE_CARD_SOURCE } from "./tutorial-snippets";

export const tutorial_composeMeta: DocPageMeta = {
  slug: "tutorial-compose",
  title: <fbt desc="Docs page title — Tutorial compose">{"6. Compose the card"}</fbt>,
  description: (
    <fbt desc="Docs page description — Put the pieces together.">
      {"Combine the Card and Button into a finished profile card."}
    </fbt>
  ),
  nav: { section: "tutorial", order: 6 },
  searchText:
    'Add one more slot to the Card for actions, then compose it with the Button in React. Each component stays an independent .arv file; you assemble them in your markup. src/App.tsx import { Card } from "./card.arv"; import { Button } from "./button.arv"; export function App() { const card = Card(); const button = Button({ tone: "primary" }); return <div className={card.root}><div className={card.avatar} /><div><div className={card.name}>Ada Lovelace</div><div className={card.role}>Engineer</div></div><div className={card.actions}><button className={button.root}>Follow</button></div></div>; } That\'s the whole idea: tokens feed components, components expose typed props and slots, and you compose them with plain markup. Where to next: Language reference, Patterns, Thinking in Arvia.',
};

export function TutorialComposePage() {
  return (
    <DocArticle meta={tutorial_composeMeta}>
      <DocP>
        <fbt desc="Docs content — tut-compose: intro">
          {
            "Add one more slot to the Card for actions, then drop the Button inside it. Each component stays its own `.arv` file — you assemble them in your markup:"
          }
        </fbt>
      </DocP>
      <DocPlayground source={PROFILE_CARD_SOURCE} height={240} />
      <DocP>
        <fbt desc="Docs content — tut-compose: react">
          {
            "In React, call each component's function and place the class names — the Button lives in the card's `actions` slot:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/App.tsx"}
        code={`import { Card } from "./card.arv";
import { Button } from "./button.arv";

export function App() {
  const card = Card();
  const button = Button({ tone: "primary" });

  return (
    <div className={card.root}>
      <div className={card.avatar} />
      <div>
        <div className={card.name}>Ada Lovelace</div>
        <div className={card.role}>Engineer</div>
      </div>
      <div className={card.actions}>
        <button className={button.root}>Follow</button>
      </div>
    </div>
  );
}`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — tut-compose: recap">
          {
            "That's the whole idea: tokens feed components, components expose typed props and slots, and you compose them with plain markup — all compiled to static CSS."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: where to next">{"Where to next"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — next language">
            {"[Language reference](/docs/components) — every construct, one page each."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — next patterns">
            {"[Patterns](/docs/patterns) — recipes for real-world UI."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — next thinking">
            {"[Thinking in Arvia](/docs/thinking-in-arvia) — the mental model behind the language."}
          </fbt>
        </DocLi>
      </DocUl>
    </DocArticle>
  );
}
