import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";
import { PROFILE_CARD_SOURCE } from "./tutorial-snippets";

export const tutorialMeta: DocPageMeta = {
  slug: "tutorial",
  title: <fbt desc="Docs page title — Tutorial">{"Tutorial: a profile card"}</fbt>,
  description: (
    <fbt desc="Docs page description — Build a profile card step by step.">
      {"Build a themed profile card from scratch — one idea per step."}
    </fbt>
  ),
  nav: { section: "tutorial", order: 0 },
  searchText:
    "In this tutorial you build a profile card with Arvia, one idea at a time: a theme of design tokens, a Button with variants, a Card with slots, hover and focus states, and a responsive touch — then compose them in React. Every step has an editable playground: change the source on the left and watch the preview, compiled CSS, and types on the right. What you need: a Vite project with Arvia installed (see Installation). Examples use React, but the .arv files are identical for Preact and Vue. Steps: 1 Set up the theme; 2 Your first component; 3 Add variants; 4 Multi-part components with slots; 5 States and responsive; 6 Compose the card.",
};

export function TutorialPage() {
  return (
    <DocArticle meta={tutorialMeta}>
      <DocP>
        <fbt desc="Docs content — tutorial: intro">
          {
            "You'll build a profile card with Arvia, adding one idea at a time: a theme of design tokens, a button with variants, a card with slots, hover and focus states, and a responsive touch. Here's where you're headed — edit the source and watch it update:"
          }
        </fbt>
      </DocP>
      <DocPlayground source={PROFILE_CARD_SOURCE} height={240} />
      <DocCallout tone="tip">
        <fbt desc="Docs note — tutorial: playground">
          {
            "Every step has an editable playground like the one above. Change the code on the left; the preview, compiled CSS, and TypeScript types update on the right."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: what you need">{"What you need"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — tutorial prereq install">
            {"A Vite project with Arvia installed — see [Installation](/docs/installation)."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — tutorial prereq framework">
            {
              "The examples use React, but the `.arv` files are identical for [Preact](/docs/preact) and [Vue](/docs/vue)."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: the steps">{"The steps"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — step 1">
            {"[1. Set up the theme](/docs/tutorial-theme) — design tokens."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — step 2">
            {"[2. Your first component](/docs/tutorial-button) — a button."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — step 3">
            {"[3. Add variants](/docs/tutorial-variants) — tone and size."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — step 4">
            {"[4. Slots](/docs/tutorial-slots) — a multi-part card."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — step 5">
            {"[5. States & responsive](/docs/tutorial-states) — hover, focus, breakpoints."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — step 6">
            {"[6. Compose the card](/docs/tutorial-compose) — put it together in React."}
          </fbt>
        </DocLi>
      </DocUl>
      <DocP>
        <fbt desc="Docs content — tutorial: start">
          {"Ready? Start with [Set up the theme](/docs/tutorial-theme)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
