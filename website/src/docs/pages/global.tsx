import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const globalMeta: DocPageMeta = {
  slug: "global",
  title: <fbt desc="Docs page title — Global styles">{"Global styles"}</fbt>,
  description: (
    <fbt desc="Docs page description — Resets, typography, and document-level rules.">
      {"Resets, typography, and document-level rules with token support."}
    </fbt>
  ),
  nav: { section: "language", order: 7 },
  searchText:
    'Most of your styles belong to components, but every app has rules that target the document itself: box-sizing resets, body typography, scrollbar tweaks, overrides for third-party widgets. The `global` block holds exactly those: src/theme.arv global {\n  * {\n    box-sizing: border-box;\n  }\n\n  html, body {\n    margin: 0;\n    min-height: 100%;\n  }\n\n  body {\n    font-family: system-ui, sans-serif;\n    line-height: 1.6;\n    background: color.background;\n    color: color.text;\n  }\n\n  a {\n    color: inherit;\n  }\n} Each rule is a selector followed by declarations. Selectors are passed through to the CSS untouched — element names, classes, attribute selectors, pseudo-classes, comma-separated lists, anything the browser accepts. Values get the full token treatment: `color.background` above compiles to the token\'s value (or its CSS variable in moded themes). Where global blocks live Global rules ship with the file that declares them, so the usual home is your theme file — import it once in your app entry and the resets arrive together with the token variables. Any `.arv` file may declare a `global` block, though: a docs-page file can carry the styles for rendered markdown, scoped to wherever that file is imported. src/main.tsx import "./theme.arv"; // global rules + token variables, once Styling third-party DOM Because selectors are verbatim, global is the escape hatch for markup you do not render yourself — syntax highlighters, embeds, portals: global {\n  .shiki {\n    margin: 0;\n    padding: space.4;\n    background: transparent !important;\n    overflow-x: auto;\n  }\n\n  .shiki code {\n    display: block;\n    min-width: min-content;\n  }\n} The rules of global Flat rules only: selector { declarations }. There is no nesting and no `&-states` — write a second rule (a:hover { … }) instead. No at-rules: `@media` and @supports cannot wrap global rules. Viewport-dependent styling belongs in components via `responsive` blocks; the mode media query is generated for you by theme modes. Unscoped by design: these rules have no hash and apply to the whole document — keep them few and foundational. Reaching for global to style your own components — global { .card:hover { … } } — defeats the checker and the hashing. If it is your markup, give it a component or a style; use global only for the document and DOM you do not own. Global vs style Both produce plain CSS, so the line is ownership of the selector. A `style` declaration exports a generated class you attach in markup — scoped, hashed, composable. A global rule styles names that already exist — elements, vendor classes. If you find yourself inventing a class name inside global, you wanted a style.',
};

export function GlobalPage() {
  return (
    <DocArticle meta={globalMeta}>
      <DocP>
        <fbt desc="Docs content — global: opening">
          {
            "Most of your styles belong to components, but every app has rules that target the document itself: box-sizing resets, body typography, scrollbar tweaks, overrides for third-party widgets. The `global` block holds exactly those:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`global {
  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    min-height: 100%;
  }

  body {
    font-family: system-ui, sans-serif;
    line-height: 1.6;
    background: color.background;
    color: color.text;
  }

  a {
    color: inherit;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — global: rule semantics">
          {
            "Each rule is a selector followed by declarations. Selectors are passed through to the CSS untouched — element names, classes, attribute selectors, pseudo-classes, comma-separated lists, anything the browser accepts. Values get the full token treatment: `color.background` above compiles to the token's value (or its CSS variable in moded themes)."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: where globals live">{"Where global blocks live"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — global: where they live">
          {
            "Global rules ship with the file that declares them, so the usual home is your theme file — import it once in your app entry and the resets arrive together with the token variables. Any `.arv` file may declare a `global` block, though: a docs-page file can carry the styles for rendered markdown, scoped to wherever that file is imported."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/main.tsx"}
        code={`import "./theme.arv"; // global rules + token variables, once`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: third-party">{"Styling third-party DOM"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — global: third-party lead-in">
          {
            "Because selectors are verbatim, global is the escape hatch for markup you do not render yourself — syntax highlighters, embeds, portals:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`global {
  .shiki {
    margin: 0;
    padding: space.4;
    background: transparent !important;
    overflow-x: auto;
  }

  .shiki code {
    display: block;
    min-width: min-content;
  }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: rules of global">{"The rules of global"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — global: flat only">
            {
              "Flat rules only: selector { declarations }. There is no nesting and no `&-states` — write a second rule (a:hover { … }) instead."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — global: no at-rules">
            {
              "No at-rules: `@media` and @supports cannot wrap global rules. Viewport-dependent styling belongs in components via `responsive` blocks; the mode media query is generated for you by theme modes."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — global: unscoped">
            {
              "Unscoped by design: these rules have no hash and apply to the whole document — keep them few and foundational."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocCallout tone="warning">
        <fbt desc="Docs note — global: anti-pattern">
          {
            "Reaching for global to style your own components — global { .card:hover { … } } — defeats the checker and the hashing. If it is your markup, give it a component or a style; use global only for the document and DOM you do not own."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: global vs style">{"Global vs style"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — global: vs style">
          {
            "Both produce plain CSS, so the line is ownership of the selector. A `style` declaration exports a generated class you attach in markup — scoped, hashed, composable. A global rule styles names that already exist — elements, vendor classes. If you find yourself inventing a class name inside global, you wanted a style."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
