import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const quick_startMeta: DocPageMeta = {
  slug: "quick-start",
  title: <fbt desc="Docs page title — Quick start">{"Quick start"}</fbt>,
  description: (
    <fbt desc="Docs page description — Build a button with one variant.">
      {"Build a themed button with one variant, in four small steps."}
    </fbt>
  ),
  nav: { section: "getting-started", order: 2 },
  searchText:
    'This assumes you finished Installation. 1. Add two tokens. src/theme.arv theme { color { primary = #635bff; danger = #e5484d; } } 2. Write a component. A component has a base block that always applies, and variants — named axes you switch from the call site. defaults picks the value used when the caller passes nothing. src/button.arv component Button { base { padding: 8px 16px; border: none; border-radius: 6px; color: white; cursor: pointer; } variants { tone { primary { background: color.primary; } danger { background: color.danger; } } } defaults { tone: primary; } } 3. Use it. Importing the file gives you a function; call it to get class names. props are typed from the .arv source. src/App.tsx import { Button } from "./button.arv"; export function App() { const save = Button(); const del = Button({ tone: "danger" }); return <><button className={save.root}>Save</button><button className={del.root}>Delete</button></>; } 4. See what shipped. Arvia emitted static CSS with hashed class names and a tiny function — no runtime. .Button_root_x { padding: 8px 16px; } .Button_tone_primary_root_x { background: #635bff; } .Button_tone_danger_root_x { background: #e5484d; } Where next: Tutorial to build a real UI step by step; Components for the full anatomy; Variants for everything variants can do.',
};

export function QuickStartPage() {
  return (
    <DocArticle meta={quick_startMeta}>
      <DocP>
        <fbt desc="Docs content — quickstart: intro">
          {
            "This builds a small button with one variant. It assumes you finished [Installation](/docs/installation)."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: add tokens">{"1. Add two tokens"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — quickstart: tokens">
          {"Tokens are named values your styles reuse. Add two colors to your theme:"}
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  color {
    primary = #635bff;
    danger = #e5484d;
  }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: write a component">{"2. Write a component"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — quickstart: component">
          {
            "A component has a `base` block that always applies, and `variants` — named axes you switch from the call site. `defaults` picks the value used when the caller passes nothing:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`component Button {
  base {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
  }

  variants {
    tone {
      primary { background: color.primary; }
      danger { background: color.danger; }
    }
  }

  defaults { tone: primary; }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: use it">{"3. Use it"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — quickstart: usage">
          {
            'Importing the file gives you a function. Call it to get class names — the `tone` prop is typed from the `.arv` source, so your editor autocompletes `"primary"` and `"danger"`:'
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/App.tsx"}
        code={`import { Button } from "./button.arv";

export function App() {
  const save = Button();                 // tone: "primary"
  const del = Button({ tone: "danger" });

  return (
    <>
      <button className={save.root}>Save</button>
      <button className={del.root}>Delete</button>
    </>
  );
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: what shipped">{"4. See what shipped"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — quickstart: output">
          {"Arvia emitted static CSS with stable, hashed class names — no runtime:"}
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS (excerpt)"}
        lang={"css"}
        code={`.Button_root_x { padding: 8px 16px; border-radius: 6px; color: white; }
.Button_tone_primary_root_x { background: #635bff; }
.Button_tone_danger_root_x { background: #e5484d; }`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — quickstart: playground">
          {
            "Paste any `.arv` example into the playground to see the CSS, JS, and types it compiles to."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: where next">{"Where next"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — next tutorial">
            {"[Tutorial](/docs/tutorial) — build a real UI, one concept at a time."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — next components">
            {"[Components](/docs/components) — the full component anatomy."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — next variants">
            {"[Variants](/docs/variants) — everything variants and defaults can do."}
          </fbt>
        </DocLi>
      </DocUl>
    </DocArticle>
  );
}
