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
    <fbt desc="Docs page description — Build a themed button in five steps.">
      {"Build a themed, variant-driven button in five small steps."}
    </fbt>
  ),
  nav: { section: "getting-started", order: 2 },
  searchText:
    'This tutorial walks through a complete, realistic setup: design tokens with a dark mode, a button with variants and a hover state, and a responsive override — with a look at what the compiler generates at each step. It assumes you finished Installation. 1. Define your tokens Everything starts with a theme file. Tokens are named values organized into groups; modes declare that some of them change between light and dark: src/theme.arv theme {\n  modes: light | dark;\n\n  color {\n    primary = #635bff;\n    text = #111111;\n    background = #ffffff;\n\n    @dark {\n      text = #eeeeee;\n      background = #111113;\n    }\n  }\n\n  space {\n    1 = 4px;\n    2 = 8px;\n    3 = 12px;\n    4 = 16px;\n  }\n\n  radius { md = 8px; }\n  font { sm = 13px; md = 15px; }\n  breakpoint { md = 768px; }\n}\n\nglobal {\n  body {\n    margin: 0;\n    font-family: system-ui, sans-serif;\n    background: color.background;\n    color: color.text;\n  }\n} Because the theme declares modes, the moded color tokens compile to CSS custom properties that flip automatically with the OS color scheme. The space and radius tokens have one value, so they are inlined wherever they are used. 2. Import the theme once src/main.tsx import "./theme.arv";\nimport { createRoot } from "react-dom/client";\nimport { App } from "./App";\n\ncreateRoot(document.getElementById("root")!).render(<App />); Importing the theme ships its global rules and CSS variables. Component files do not import the theme — the Vite plugin makes its tokens visible to every `.arv` file in the project automatically. 3. Create a component src/button.arv component Button {\n  base {\n    display: inline-flex;\n    align-items: center;\n    gap: space.2;\n    border: none;\n    border-radius: radius.md;\n    color: white;\n    cursor: pointer;\n    background: color.primary;\n\n    &:hover {\n      filter: brightness(1.08);\n    }\n  }\n\n  variants {\n    size {\n      sm { padding: space.1 space.3; font-size: font.sm; }\n      lg { padding: space.2 space.4; font-size: font.md; }\n    }\n  }\n\n  defaults { size: sm; }\n\n  responsive {\n    md { size: lg; }\n  }\n} Read it top to bottom: base styles apply always, each size value adds its own padding and font-size, sm is the default when callers pass nothing, and the `responsive` block bumps the default to lg once the viewport crosses the md breakpoint from the theme. 4. Use it in your app src/App.tsx import { Button } from "./button.arv";\n\nexport function App() {\n  const styles = Button();          // size: "sm", grows to lg at 768px\n  const big = Button({ size: "lg" }); // always lg\n\n  return (\n    <main>\n      <button className={styles.root}>Get started</button>\n      <button className={big.root}>Always big</button>\n    </main>\n  );\n} Hover over Button in your editor: the props are fully typed from the .arv source, including the responsive object form { initial: "sm", md: "lg" } for per-breakpoint control from the call site. 5. See what you shipped The compiler emitted static CSS with stable, hashed class names, and a small JS module. The interesting part of each: generated CSS (excerpt) .Button_root_0tbkbv {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  /* … */\n}\n\n.Button_size_sm_root_0tbkbv { padding: 4px 12px; font-size: 13px; }\n.Button_size_lg_root_0tbkbv { padding: 8px 16px; font-size: 15px; }\n\n@media (min-width: 768px) {\n.Button_size_lg_bp_md_root_0tbkbv { padding: 8px 16px; font-size: 15px; }\n} generated JS (conceptually) export function Button(props) {\n  // pure lookups — returns { root: "Button_root_0tbkbv Button_size_sm_root_0tbkbv …" }\n} Toggle your OS color scheme while the dev server runs: the page flips to dark with no JavaScript involved, because the moded tokens are plain CSS custom properties. Where to next [Thinking in Arvia](/docs/thinking-in-arvia) — the mental model behind the language and when to reach for each construct. [Theme & tokens](/docs/theme) — everything tokens can do: aliases, doc strings, digit-led scales. [Components](/docs/components) — slots, states, compound variants, and the full component anatomy.',
};

export function QuickStartPage() {
  return (
    <DocArticle meta={quick_startMeta}>
      <DocP>
        <fbt desc="Docs content — quickstart: overview">
          {
            "This tutorial walks through a complete, realistic setup: design tokens with a dark mode, a button with variants and a hover state, and a responsive override — with a look at what the compiler generates at each step. It assumes you finished Installation."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — 1. Define your tokens">{"1. Define your tokens"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — quickstart: tokens lead-in">
          {
            "Everything starts with a theme file. Tokens are named values organized into groups; modes declare that some of them change between light and dark:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  modes: light | dark;

  color {
    primary = #635bff;
    text = #111111;
    background = #ffffff;

    @dark {
      text = #eeeeee;
      background = #111113;
    }
  }

  space {
    1 = 4px;
    2 = 8px;
    3 = 12px;
    4 = 16px;
  }

  radius { md = 8px; }
  font { sm = 13px; md = 15px; }
  breakpoint { md = 768px; }
}

global {
  body {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: color.background;
    color: color.text;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — quickstart: tokens explanation">
          {
            "Because the theme declares modes, the moded color tokens compile to CSS custom properties that flip automatically with the OS color scheme. The space and radius tokens have one value, so they are inlined wherever they are used."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — 2. Import theme once">{"2. Import the theme once"}</fbt>
      </DocH2>
      <DocCode
        label={"src/main.tsx"}
        code={`import "./theme.arv";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);`}
      />
      <DocP>
        <fbt desc="Docs content — quickstart: import theme explanation">
          {
            "Importing the theme ships its global rules and CSS variables. Component files do not import the theme — the Vite plugin makes its tokens visible to every `.arv` file in the project automatically."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — 3. Create a component">{"3. Create a component"}</fbt>
      </DocH2>
      <DocCode
        label={"src/button.arv"}
        code={`component Button {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    border: none;
    border-radius: radius.md;
    color: white;
    cursor: pointer;
    background: color.primary;

    &:hover {
      filter: brightness(1.08);
    }
  }

  variants {
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      lg { padding: space.2 space.4; font-size: font.md; }
    }
  }

  defaults { size: sm; }

  responsive {
    md { size: lg; }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — quickstart: component explanation">
          {
            "Read it top to bottom: base styles apply always, each size value adds its own padding and font-size, sm is the default when callers pass nothing, and the `responsive` block bumps the default to lg once the viewport crosses the md breakpoint from the theme."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — 4. Use in your app">{"4. Use it in your app"}</fbt>
      </DocH2>
      <DocCode
        label={"src/App.tsx"}
        code={`import { Button } from "./button.arv";

export function App() {
  const styles = Button();          // size: "sm", grows to lg at 768px
  const big = Button({ size: "lg" }); // always lg

  return (
    <main>
      <button className={styles.root}>Get started</button>
      <button className={big.root}>Always big</button>
    </main>
  );
}`}
      />
      <DocP>
        <fbt desc="Docs content — quickstart: usage explanation">
          {
            'Hover over Button in your editor: the props are fully typed from the .arv source, including the responsive object form { initial: "sm", md: "lg" } for per-breakpoint control from the call site.'
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — 5. What you shipped">{"5. See what you shipped"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — quickstart: output lead-in">
          {
            "The compiler emitted static CSS with stable, hashed class names, and a small JS module. The interesting part of each:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS (excerpt)"}
        lang={"css"}
        code={`.Button_root_0tbkbv {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  /* … */
}

.Button_size_sm_root_0tbkbv { padding: 4px 12px; font-size: 13px; }
.Button_size_lg_root_0tbkbv { padding: 8px 16px; font-size: 15px; }

@media (min-width: 768px) {
.Button_size_lg_bp_md_root_0tbkbv { padding: 8px 16px; font-size: 15px; }
}`}
      />
      <DocCode
        label={"generated JS (conceptually)"}
        lang={"js"}
        code={`export function Button(props) {
  // pure lookups — returns { root: "Button_root_0tbkbv Button_size_sm_root_0tbkbv …" }
}`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — quickstart dark mode tip">
          {
            "Toggle your OS color scheme while the dev server runs: the page flips to dark with no JavaScript involved, because the moded tokens are plain CSS custom properties."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: where to next">{"Where to next"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — next: thinking">
            {
              "[Thinking in Arvia](/docs/thinking-in-arvia) — the mental model behind the language and when to reach for each construct."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — next: theme">
            {
              "[Theme & tokens](/docs/theme) — everything tokens can do: aliases, doc strings, digit-led scales."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — next: components">
            {
              "[Components](/docs/components) — slots, states, compound variants, and the full component anatomy."
            }
          </fbt>
        </DocLi>
      </DocUl>
    </DocArticle>
  );
}
