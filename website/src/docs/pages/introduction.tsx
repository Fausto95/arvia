import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const introductionMeta: DocPageMeta = {
  slug: "introduction",
  title: <fbt desc="Docs page title — Introduction">{"Introduction"}</fbt>,
  description: (
    <fbt desc="Docs page description — What Arvia is and how it works.">
      {"What Arvia is, and how it works — in a couple of minutes."}
    </fbt>
  ),
  nav: { section: "getting-started", order: 0 },
  searchText:
    'Arvia is a styling compiler. You write your styles in .arv files, and Arvia turns them into plain CSS plus a small, typed function you call from your components. Nothing runs in the browser at runtime — every class name exists before your app starts. You write this button.arv component Button { base { padding: 8px 16px; border-radius: 6px; background: #635bff; color: white; } } Importing it gives you a function. Calling it returns class names you put on your own markup. import { Button } from "./button.arv"; const s = Button(); <button className={s.root}>Save</button>. There is no <Button> component — Arvia gives you class names, you keep your own markup, refs, and events. What you can write theme tokens like colors and spacing; component a typed, variant-driven style generator; style a single utility class; recipe a reusable style fragment; global document-level CSS; keyframes a named animation. Why Arvia zero runtime, typed props from your styles, works with any framework that renders a class attribute. Next Installation and Quick start.',
};

export function IntroductionPage() {
  return (
    <DocArticle meta={introductionMeta}>
      <DocP>
        <fbt desc="Docs content — intro: what">
          {
            "Arvia is a styling compiler. You write your styles in `.arv` files, and Arvia turns them into plain CSS plus a small, typed function you call from your components."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — intro: compiled">
          {
            "Nothing styling-related runs in the browser — every class name and CSS rule exists before your app starts. That keeps your pages fast and your styles fully typed."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: a tiny example">{"A tiny example"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — intro: example lead-in">{"You write a component:"}</fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  base {
    padding: 8px 16px;
    border-radius: 6px;
    background: #635bff;
    color: white;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — intro: usage lead-in">
          {"Importing it gives you a function. Call it to get class names for your own markup:"}
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`import { Button } from "./button.arv";

const s = Button();
<button className={s.root}>Save</button>;`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — intro: no component">
          {
            "There is no `<Button>` component to render. Arvia gives you class names; you keep full control of your markup, refs, and events."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: what you can write">{"What you can write"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — intro: constructs lead-in">
          {"An `.arv` file is made of a few simple building blocks:"}
        </fbt>
      </DocP>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — theme">
            {"[`theme`](/docs/theme) — design tokens like colors and spacing."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — component">
            {"[`component`](/docs/components) — a typed, variant-driven style generator."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — style">
            {"[`style`](/docs/styles) — a single utility class exported as a string."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — recipe">
            {"[`recipe`](/docs/recipes) — a reusable style fragment other rules pull in."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — global">
            {"[`global`](/docs/global) — document-level CSS like resets and body styles."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — keyframes">
            {"[`keyframes`](/docs/keyframes) — a named CSS animation."}
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: why arvia">{"Why Arvia"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — why zero runtime">
            {"Zero runtime — the browser only ever sees static CSS and class-name strings."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — why typed">
            {"Typed — variant props and token names are checked, with editor autocomplete."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — why agnostic">
            {
              "Framework-agnostic — anything that renders a `class` attribute works: React, Preact, Vue, and more."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: next">{"Next"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — intro: next">
          {
            "Ready? [Install Arvia](/docs/installation), then follow the [Quick start](/docs/quick-start). Prefer to learn by building? Jump into the [Tutorial](/docs/tutorial)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
