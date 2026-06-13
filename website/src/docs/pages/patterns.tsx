import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";

// A polished, interactive button for the live playground: it layers a recipe
// (Interactive), styles icon + label slots, and slides the arrow on a
// cross-slot hover — several patterns from this page in one component that
// renders beautifully on its own.
const PATTERN_DEMO_SOURCE = `theme {
  color {
    accent = #635bff;
    accentHover = #5249e6;
    text = #1a1a2e;
  }
  space { 2 = 8px; 3 = 12px; 5 = 24px; }
  radius { md = 10px; }
  font { md = 15px; }
}

recipe Interactive {
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: background 150ms ease, transform 80ms ease, box-shadow 150ms ease;

  &:focus-visible {
    outline: 2px solid color.text;
    outline-offset: 2px;
  }
  &:active { transform: translateY(1px); }
}

component Button {
  slots { root {} icon {} label {} }

  base {
    use Interactive;
    display: inline-flex;
    align-items: center;
    gap: space.2;
    padding: space.3 space.5;
    border: none;
    border-radius: radius.md;
    background: color.accent;
    color: white;
    font-size: font.md;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(99, 91, 255, 0.35);

    icon { transition: transform 150ms ease; }
    label { white-space: nowrap; }

    &:hover {
      background: color.accentHover;
      box-shadow: 0 4px 14px rgba(99, 91, 255, 0.45);
      icon { transform: translateX(4px); }
    }
  }
}`;

export const patternsMeta: DocPageMeta = {
  slug: "patterns",
  title: <fbt desc="Docs page title — Advanced patterns">{"Advanced patterns"}</fbt>,
  description: (
    <fbt desc="Docs page description — Advanced composition patterns.">
      {"Recipes for real systems: layered recipes, data-state styling, adaptive layouts."}
    </fbt>
  ),
  nav: { section: "deep-dives", order: 2 },
  searchText:
    'Every pattern here uses only features from the language pages — what changes is how far they are pushed and how they combine. All examples are complete and compile as written (given the tokens they reference). A layered recipe library Treat theme recipes as your system\'s axioms — small, orthogonal, and combinable. Higher layers add meaning, components add looks: src/theme.arv recipe FocusRing {\n  outline: none;\n  &:focus-visible {\n    outline: 2px solid color.accent;\n    outline-offset: 2px;\n  }\n}\n\nrecipe PressEffect {\n  &:active { transform: translateY(1px); }\n}\n\nrecipe Interactive {\n  use FocusRing;\n  use PressEffect;\n  cursor: pointer;\n  user-select: none;\n  &:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }\n}\n\nrecipe Surface {\n  background: color.surface;\n  border: 1px solid color.border;\n  border-radius: radius.lg;\n} anywhere component IconButton {\n  use Interactive;\n  display: inline-grid;\n  place-items: center;\n  width: 32px;\n  height: 32px;\n  border-radius: radius.md;\n} When the design team changes what “focusable” means, one recipe edit updates every interactive element — and because recipes flatten at compile time, the runtime cost of the abstraction is zero. Group hover menus Cross-slot states handle reveal-on-hover UI without a line of JavaScript. The actions slot fades in when the row is hovered or anything inside it has focus: list-row.arv component ListRow {\n  slots { root {} title {} actions {} }\n\n  base {\n    display: flex;\n    align-items: center;\n    gap: space.3;\n    padding: space.2 space.3;\n    border-radius: radius.md;\n\n    title { flex: 1; min-width: 0; }\n    actions { opacity: 0; transition: opacity duration.fast; }\n\n    &:hover {\n      background: color.surfaceRaised;\n      actions { opacity: 1; }\n    }\n\n    &:focus-within {\n      actions { opacity: 1; }\n    }\n  }\n} The `&:focus-within` block keeps the pattern accessible: keyboard users tabbing to a hidden action button reveal the actions too. Pair reveal-on-hover with focus-within every time. Data-attribute state machines For state that changes every frame or comes from a headless UI library, skip variants and bind styles to data attributes — the JS writes one attribute, the CSS does the rest: disclosure.arv component Disclosure {\n  slots { root {} trigger {} chevron {} panel {} }\n\n  base {\n    trigger {\n      use Interactive;\n      display: flex;\n      align-items: center;\n      gap: space.2;\n      width: 100%;\n    }\n\n    chevron { transition: transform duration.fast easing.out; }\n    panel { display: none; padding: space.3; }\n\n    &[data-state="open"] {\n      chevron { transform: rotate(90deg); }\n      panel { display: block; }\n    }\n  }\n} Disclosure.tsx const s = Disclosure();\n\n<div className={s.root} data-state={open ? "open" : "closed"}>\n  <button className={s.trigger} aria-expanded={open} onClick={toggle}>\n    <span className={s.chevron}>▸</span> {label}\n  </button>\n  <div className={s.panel}>{children}</div>\n</div> The dividing line from variants: variants are for values decided at render time and worth type-checking; data attributes are for live state the DOM already tracks. Radix-style libraries set data-state for you — this pattern styles them directly. The fully adaptive card Everything at once — slots, variants, compound, container queries, and a recipe — in a component that stays correct in any column the layout offers: feature-card.arv component FeatureCard {\n  slots { root {} media {} body {} title {} meta {} }\n\n  base {\n    use Surface;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n\n    media { aspect-ratio: 16 / 9; background: color.surfaceRaised; }\n    body { display: flex; flex-direction: column; gap: space.2; padding: space.4; }\n    title { font-size: font.lg; font-weight: 600; }\n    meta { color: color.muted; font-size: font.sm; }\n  }\n\n  variants {\n    emphasis {\n      normal {}\n      featured {\n        border-color: color.accent;\n        title { color: color.accent; }\n      }\n    }\n    layout {\n      stacked {}\n      split {\n        flex-direction: row;\n        media { aspect-ratio: auto; width: 240px; }\n      }\n    }\n  }\n\n  defaults { emphasis: normal; layout: stacked; }\n\n  container {\n    wide { layout: split; }      // go horizontal when ≥ wide\n  }\n\n  compound {\n    emphasis: featured;\n    layout: split;\n    media { width: 320px; }      // featured + split earns bigger art\n  }\n} Trace a card rendered in a 700px column: the `container` block flips layout to split, and if it is also featured, the compound matches and widens the media slot. Drag the same card into a 300px sidebar and all of it unwinds — no props, no resize observers. Page-level composition Styles and components cooperate at the page level: components own reusable pieces, styles own the page\'s one-off scaffolding, and class concatenation glues them: dashboard.arv style dashboardGrid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: space.4;\n}\n\nstyle spanTwo {\n  grid-column: span 2;\n} Dashboard.tsx import { dashboardGrid, spanTwo } from "./dashboard.arv";\nimport { FeatureCard } from "./feature-card.arv";\n\nconst hero = FeatureCard({ emphasis: "featured" });\nconst card = FeatureCard();\n\n<div className={dashboardGrid}>\n  <article className={`${hero.root} ${spanTwo}`}>…</article>\n  <article className={card.root}>…</article>\n</div> The grid auto-fills and the cards adapt per container — the two patterns multiply: one component definition covers every cell shape this page can produce.',
};

export function PatternsPage() {
  return (
    <DocArticle meta={patternsMeta}>
      <DocP>
        <fbt desc="Docs content — patterns: opening">
          {
            "Every pattern here uses only features from the language pages — what changes is how far they are pushed and how they combine. All examples are complete and compile as written (given the tokens they reference)."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: pattern recipe library">
          {"A layered recipe library"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — patterns: recipe library lead-in">
          {
            "Treat theme recipes as your system's axioms — small, orthogonal, and combinable. Higher layers add meaning, components add looks:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`recipe FocusRing {
  outline: none;
  &:focus-visible {
    outline: 2px solid color.accent;
    outline-offset: 2px;
  }
}

recipe PressEffect {
  &:active { transform: translateY(1px); }
}

recipe Interactive {
  use FocusRing;
  use PressEffect;
  cursor: pointer;
  user-select: none;
  &:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
}

recipe Surface {
  background: color.surface;
  border: 1px solid color.border;
  border-radius: radius.lg;
}`}
      />
      <DocCode
        label={"anywhere"}
        code={`component IconButton {
  use Interactive;
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: radius.md;
}`}
      />
      <DocP>
        <fbt desc="Docs content — patterns: recipe library payoff">
          {
            "When the design team changes what “focusable” means, one recipe edit updates every interactive element — and because recipes flatten at compile time, the runtime cost of the abstraction is zero."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: pattern group hover">{"Group hover menus"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — patterns: group hover lead-in">
          {
            "Cross-slot states handle reveal-on-hover UI without a line of JavaScript. The actions slot fades in when the row is hovered or anything inside it has focus:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"list-row.arv"}
        code={`component ListRow {
  slots { root {} title {} actions {} }

  base {
    display: flex;
    align-items: center;
    gap: space.3;
    padding: space.2 space.3;
    border-radius: radius.md;

    title { flex: 1; min-width: 0; }
    actions { opacity: 0; transition: opacity duration.fast; }

    &:hover {
      background: color.surfaceRaised;
      actions { opacity: 1; }
    }

    &:focus-within {
      actions { opacity: 1; }
    }
  }
}`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — patterns: focus-within">
          {
            "The `&:focus-within` block keeps the pattern accessible: keyboard users tabbing to a hidden action button reveal the actions too. Pair reveal-on-hover with focus-within every time."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — patterns: cross-slot playground lead">
          {
            "The same cross-slot trick, live — this button layers the `Interactive` recipe and slides its `icon` slot when the root is hovered. Hover it, and tweak the source:"
          }
        </fbt>
      </DocP>
      <DocPlayground source={PATTERN_DEMO_SOURCE} height={280} />
      <DocH2>
        <fbt desc="Docs content — heading: pattern data state">
          {"Data-attribute state machines"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — patterns: data state lead-in">
          {
            "For state that changes every frame or comes from a headless UI library, skip variants and bind styles to data attributes — the JS writes one attribute, the CSS does the rest:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"disclosure.arv"}
        code={`component Disclosure {
  slots { root {} trigger {} chevron {} panel {} }

  base {
    trigger {
      use Interactive;
      display: flex;
      align-items: center;
      gap: space.2;
      width: 100%;
    }

    chevron { transition: transform duration.fast easing.out; }
    panel { display: none; padding: space.3; }

    &[data-state="open"] {
      chevron { transform: rotate(90deg); }
      panel { display: block; }
    }
  }
}`}
      />
      <DocCode
        label={"Disclosure.tsx"}
        code={`const s = Disclosure();

<div className={s.root} data-state={open ? "open" : "closed"}>
  <button className={s.trigger} aria-expanded={open} onClick={toggle}>
    <span className={s.chevron}>▸</span> {label}
  </button>
  <div className={s.panel}>{children}</div>
</div>`}
      />
      <DocP>
        <fbt desc="Docs content — patterns: data state vs variants">
          {
            "The dividing line from variants: variants are for values decided at render time and worth type-checking; data attributes are for live state the DOM already tracks. Radix-style libraries set data-state for you — this pattern styles them directly."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: pattern adaptive card">{"The fully adaptive card"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — patterns: adaptive card lead-in">
          {
            "Everything at once — slots, variants, compound, container queries, and a recipe — in a component that stays correct in any column the layout offers:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"feature-card.arv"}
        code={`component FeatureCard {
  slots { root {} media {} body {} title {} meta {} }

  base {
    use Surface;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    media { aspect-ratio: 16 / 9; background: color.surfaceRaised; }
    body { display: flex; flex-direction: column; gap: space.2; padding: space.4; }
    title { font-size: font.lg; font-weight: 600; }
    meta { color: color.muted; font-size: font.sm; }
  }

  variants {
    emphasis {
      normal {}
      featured {
        border-color: color.accent;
        title { color: color.accent; }
      }
    }
    layout {
      stacked {}
      split {
        flex-direction: row;
        media { aspect-ratio: auto; width: 240px; }
      }
    }
  }

  defaults { emphasis: normal; layout: stacked; }

  container {
    wide { layout: split; }      // go horizontal when ≥ wide
  }

  compound {
    emphasis: featured;
    layout: split;
    media { width: 320px; }      // featured + split earns bigger art
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — patterns: adaptive card trace">
          {
            "Trace a card rendered in a 700px column: the `container` block flips layout to split, and if it is also featured, the compound matches and widens the media slot. Drag the same card into a 300px sidebar and all of it unwinds — no props, no resize observers."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: pattern page level">{"Page-level composition"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — patterns: page level lead-in">
          {
            "Styles and components cooperate at the page level: components own reusable pieces, styles own the page's one-off scaffolding, and class concatenation glues them:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"dashboard.arv"}
        code={`style dashboardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: space.4;
}

style spanTwo {
  grid-column: span 2;
}`}
      />
      <DocCode
        label={"Dashboard.tsx"}
        code={`import { dashboardGrid, spanTwo } from "./dashboard.arv";
import { FeatureCard } from "./feature-card.arv";

const hero = FeatureCard({ emphasis: "featured" });
const card = FeatureCard();

<div className={dashboardGrid}>
  <article className={\`\${hero.root} \${spanTwo}\`}>…</article>
  <article className={card.root}>…</article>
</div>`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — patterns: multiply">
          {
            "The grid auto-fills and the cards adapt per container — the two patterns multiply: one component definition covers every cell shape this page can produce."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
