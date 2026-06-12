import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const introductionMeta: DocPageMeta = {
  slug: "introduction",
  title: <fbt desc="Docs page title — Introduction">{"Introduction"}</fbt>,
  description: (
    <fbt desc="Docs page description — What Arvia is, how it works, and how it compares.">
      {"What Arvia is, how it works, and how it compares to other styling approaches."}
    </fbt>
  ),
  nav: { section: "getting-started", order: 0 },
  searchText:
    'Arvia is a design system compiler. You describe your design system — tokens, themes, reusable style fragments, and multi-variant components — in `.arv` files, and the compiler turns them into three artifacts: plain CSS, a tiny typed JavaScript API, and TypeScript declarations. Nothing styling-related runs in the browser at runtime; every class name and every rule exists before your app boots. That single idea — styles are compiled, not computed — drives everything else in the language. Because the compiler sees your whole design system at build time, it can give you typo-proof token references, typed component props, dead-variant warnings, and editor autocomplete, while shipping CSS that is indistinguishable from hand-written stylesheets. A taste of the language Here is a complete, working Arvia file. It defines two design tokens, a reusable focus-ring recipe, and a button component with two variant dimensions: button.arv theme {\n  color {\n    primary = #635bff;\n    danger = #e5484d;\n  }\n}\n\nrecipe FocusRing {\n  outline: none;\n  &:focus-visible {\n    outline: 2px solid color.primary;\n    outline-offset: 2px;\n  }\n}\n\ncomponent Button {\n  base {\n    display: inline-flex;\n    align-items: center;\n    border-radius: 8px;\n    cursor: pointer;\n    use FocusRing;\n  }\n\n  variants {\n    size {\n      sm { padding: 4px 12px; }\n      lg { padding: 8px 20px; }\n    }\n    tone {\n      primary { background: color.primary; color: white; }\n      danger { background: color.danger; color: white; }\n    }\n  }\n\n  defaults { size: sm; tone: primary; }\n} Importing this file gives you a plain function. Calling it returns class names — one per element the component styles — with full TypeScript checking on every prop: App.tsx import { Button } from "./button.arv";\n\nconst styles = Button({ size: "lg", tone: "danger" });\n// styles.root === "Button_root_0p4oom Button_size_lg_root_0p4oom Button_tone_danger_root_0p4oom"\n\n<button className={styles.root}>Delete</button>\n\nButton({ size: "xl" });\n//        ~~~~ TypeScript error: \'"xl"\' is not assignable to \'"sm" | "lg"\' There is no <Button> React component here, and that is deliberate. Arvia generates styling APIs, not UI components — you keep full control of your markup, accessibility attributes, and event handling. The generated function is pure string concatenation: no style injection, no context providers, no runtime theme objects. The six building blocks Everything you can write at the top level of an `.arv` file is one of six constructs. Each has its own page in these docs, but the one-line summary is: Construct What it does theme { … } Declares global design tokens (colors, spacing, …) and optional light/dark modes. global { … } Emits document-level CSS rules: resets, body typography, third-party overrides. recipe Name { … } A reusable style fragment that other declarations pull in with \'use\'. Generates no output by itself. style name { … } A single CSS class exported as a string constant — utilities without component ceremony. component Name { … } A typed, multi-variant, multi-slot style generator — the heart of the language. keyframes name { … } A named CSS animation, referenced from components as `keyframes.name`. How it compares Arvia sits in the build-time styling camp, but it differs from its neighbors in what it makes first-class. The honest comparison: Approach Runtime cost Where Arvia differs CSS-in-JS (styled-components, Emotion) Styles computed and injected in the browser Arvia resolves everything at build time; the browser only ever sees static CSS and class-name strings. CSS Modules None CSS Modules scope class names but know nothing about your design system. Arvia adds typed variants, slots, compound rules, and tokens with checked references. Tailwind CSS None Tailwind composes utilities in markup; component variants live in className logic. Arvia moves that logic into a compiled, typed definition next to your styles. vanilla-extract None Closest in spirit. vanilla-extract is TypeScript-first; Arvia is a dedicated language with CSS-native syntax, its own checker with did-you-mean fixes, and a language server. Framework-agnostic by design The generated JavaScript has zero dependencies — it is a handful of object lookups and string concatenations. Official Vite plugins exist for React, Preact, and Vue, but anything that can render a class attribute can consume an Arvia component: Svelte, Solid, Lit, or a server-rendered template. The fastest way to get a feel for the language is the interactive playground — every example in these docs can be pasted there to inspect the CSS, JS, and type declarations it compiles to. Ready to set it up? Head to [Installation](/docs/installation), or skim [Thinking in Arvia](/docs/thinking-in-arvia) first if you want the mental model before the mechanics.',
};

export function IntroductionPage() {
  return (
    <DocArticle meta={introductionMeta}>
      <DocP>
        <fbt desc="Docs content — intro: what Arvia is">
          {
            "Arvia is a design system compiler. You describe your design system — tokens, themes, reusable style fragments, and multi-variant components — in `.arv` files, and the compiler turns them into three artifacts: plain CSS, a tiny typed JavaScript API, and TypeScript declarations. Nothing styling-related runs in the browser at runtime; every class name and every rule exists before your app boots."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — intro: compiled not computed">
          {
            "That single idea — styles are compiled, not computed — drives everything else in the language. Because the compiler sees your whole design system at build time, it can give you typo-proof token references, typed component props, dead-variant warnings, and editor autocomplete, while shipping CSS that is indistinguishable from hand-written stylesheets."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: a taste">{"A taste of the language"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — intro: taste example lead-in">
          {
            "Here is a complete, working Arvia file. It defines two design tokens, a reusable focus-ring recipe, and a button component with two variant dimensions:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`theme {
  color {
    primary = #635bff;
    danger = #e5484d;
  }
}

recipe FocusRing {
  outline: none;
  &:focus-visible {
    outline: 2px solid color.primary;
    outline-offset: 2px;
  }
}

component Button {
  base {
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    cursor: pointer;
    use FocusRing;
  }

  variants {
    size {
      sm { padding: 4px 12px; }
      lg { padding: 8px 20px; }
    }
    tone {
      primary { background: color.primary; color: white; }
      danger { background: color.danger; color: white; }
    }
  }

  defaults { size: sm; tone: primary; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — intro: usage lead-in">
          {
            "Importing this file gives you a plain function. Calling it returns class names — one per element the component styles — with full TypeScript checking on every prop:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`import { Button } from "./button.arv";

const styles = Button({ size: "lg", tone: "danger" });
// styles.root === "Button_root_0p4oom Button_size_lg_root_0p4oom Button_tone_danger_root_0p4oom"

<button className={styles.root}>Delete</button>

Button({ size: "xl" });
//        ~~~~ TypeScript error: '"xl"' is not assignable to '"sm" | "lg"'`}
      />
      <DocP>
        <fbt desc="Docs content — intro: styling API not components">
          {
            "There is no <Button> React component here, and that is deliberate. Arvia generates styling APIs, not UI components — you keep full control of your markup, accessibility attributes, and event handling. The generated function is pure string concatenation: no style injection, no context providers, no runtime theme objects."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: six blocks">{"The six building blocks"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — intro: six constructs lead-in">
          {
            "Everything you can write at the top level of an `.arv` file is one of six constructs. Each has its own page in these docs, but the one-line summary is:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — construct">{"Construct"}</fbt>,
          <fbt desc="Docs table header — what it does">{"What it does"}</fbt>,
        ]}
        rows={[
          [
            "theme { … }",
            <fbt desc="Docs table cell — theme summary">
              {"Declares global design tokens (colors, spacing, …) and optional light/dark modes."}
            </fbt>,
          ],
          [
            "global { … }",
            <fbt desc="Docs table cell — global summary">
              {"Emits document-level CSS rules: resets, body typography, third-party overrides."}
            </fbt>,
          ],
          [
            "recipe Name { … }",
            <fbt desc="Docs table cell — recipe summary">
              {
                "A reusable style fragment that other declarations pull in with 'use'. Generates no output by itself."
              }
            </fbt>,
          ],
          [
            "style name { … }",
            <fbt desc="Docs table cell — style summary">
              {
                "A single CSS class exported as a string constant — utilities without component ceremony."
              }
            </fbt>,
          ],
          [
            "component Name { … }",
            <fbt desc="Docs table cell — component summary">
              {"A typed, multi-variant, multi-slot style generator — the heart of the language."}
            </fbt>,
          ],
          [
            "keyframes name { … }",
            <fbt desc="Docs table cell — keyframes summary">
              {"A named CSS animation, referenced from components as `keyframes.name`."}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: how it compares">{"How it compares"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — intro: comparison lead-in">
          {
            "Arvia sits in the build-time styling camp, but it differs from its neighbors in what it makes first-class. The honest comparison:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — approach">{"Approach"}</fbt>,
          <fbt desc="Docs table header — runtime cost">{"Runtime cost"}</fbt>,
          <fbt desc="Docs table header — where Arvia differs">{"Where Arvia differs"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — css-in-js">
              {"CSS-in-JS (styled-components, Emotion)"}
            </fbt>,
            <fbt desc="Docs table cell — css-in-js cost">
              {"Styles computed and injected in the browser"}
            </fbt>,
            <fbt desc="Docs table cell — css-in-js diff">
              {
                "Arvia resolves everything at build time; the browser only ever sees static CSS and class-name strings."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — css modules">{"CSS Modules"}</fbt>,
            <fbt desc="Docs table cell — css modules cost">{"None"}</fbt>,
            <fbt desc="Docs table cell — css modules diff">
              {
                "CSS Modules scope class names but know nothing about your design system. Arvia adds typed variants, slots, compound rules, and tokens with checked references."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — tailwind">{"Tailwind CSS"}</fbt>,
            <fbt desc="Docs table cell — tailwind cost">{"None"}</fbt>,
            <fbt desc="Docs table cell — tailwind diff">
              {
                "Tailwind composes utilities in markup; component variants live in className logic. Arvia moves that logic into a compiled, typed definition next to your styles."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — vanilla-extract">{"vanilla-extract"}</fbt>,
            <fbt desc="Docs table cell — vanilla-extract cost">{"None"}</fbt>,
            <fbt desc="Docs table cell — vanilla-extract diff">
              {
                "Closest in spirit. vanilla-extract is TypeScript-first; Arvia is a dedicated language with CSS-native syntax, its own checker with did-you-mean fixes, and a language server."
              }
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: agnostic">{"Framework-agnostic by design"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — intro: framework agnostic">
          {
            "The generated JavaScript has zero dependencies — it is a handful of object lookups and string concatenations. Official Vite plugins exist for React, Preact, and Vue, but anything that can render a class attribute can consume an Arvia component: Svelte, Solid, Lit, or a server-rendered template."
          }
        </fbt>
      </DocP>
      <DocCallout tone="tip">
        <fbt desc="Docs note — try the playground">
          {
            "The fastest way to get a feel for the language is the interactive playground — every example in these docs can be pasted there to inspect the CSS, JS, and type declarations it compiles to."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — intro: next steps">
          {
            "Ready to set it up? Head to [Installation](/docs/installation), or skim [Thinking in Arvia](/docs/thinking-in-arvia) first if you want the mental model before the mechanics."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
