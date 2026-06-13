import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";
import { BUTTON_BASE_SOURCE } from "./tutorial-snippets";

export const tutorial_buttonMeta: DocPageMeta = {
  slug: "tutorial-button",
  title: <fbt desc="Docs page title — Tutorial button">{"2. Your first component"}</fbt>,
  description: (
    <fbt desc="Docs page description — Write a Button component.">
      {"Write a Button and use it from React."}
    </fbt>
  ),
  nav: { section: "tutorial", order: 2 },
  searchText:
    'A component groups styles under a name. The base block holds the styles that always apply. src/button.arv component Button { base { display: inline-flex; align-items: center; gap: space.2; padding: space.2 space.4; border: none; border-radius: radius.md; background: color.primary; color: white; font-size: font.md; cursor: pointer; } } Importing the file gives you a function. Call it to get class names; put them on your own element. src/App.tsx import { Button } from "./button.arv"; export function App() { const s = Button(); return <button className={s.root}>Save</button>; } s.root is a string of class names. There is no Button element to render — you own the markup. Next: add variants.',
};

export function TutorialButtonPage() {
  return (
    <DocArticle meta={tutorial_buttonMeta}>
      <DocP>
        <fbt desc="Docs content — tut-button: intro">
          {
            "A `component` groups styles under a name. The `base` block holds the styles that always apply. Create `src/button.arv` and reference the tokens from step 1:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`component Button {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    padding: space.2 space.4;
    border: none;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font-size: font.md;
    cursor: pointer;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — tut-button: usage">
          {
            "Importing the file gives you a function. Call it to get class names, and put them on your own element:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/App.tsx"}
        code={`import { Button } from "./button.arv";

export function App() {
  const s = Button();
  return <button className={s.root}>Save</button>;
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — tut-button: own markup">
          {
            "`s.root` is a string of class names. There's no `<Button>` element to render — you keep your own markup, refs, and events."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: try it">{"Try it"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — tut-button: playground lead">
          {"Tweak the padding or background and watch the button change:"}
        </fbt>
      </DocP>
      <DocPlayground source={BUTTON_BASE_SOURCE} />
      <DocP>
        <fbt desc="Docs content — tut-button: next">
          {"Next: [add variants](/docs/tutorial-variants)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
