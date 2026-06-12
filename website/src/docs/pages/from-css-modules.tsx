import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const from_css_modulesMeta: DocPageMeta = {
  slug: "from-css-modules",
  title: <fbt desc="Docs page title — Coming from CSS Modules">{"Coming from CSS Modules"}</fbt>,
  description: (
    <fbt desc="Docs page description — Migrating from CSS Modules.">
      {"Keep the scoping you like; replace the conditional-className logic you don't."}
    </fbt>
  ),
  nav: { section: "migrate", order: 24 },
  searchText:
    'CSS Modules users already live the Arvia workflow: styles in a sibling file, scoped class names, an import that yields classes. What CSS Modules never had is knowledge of your design system — variants live in JS conditionals, tokens are unchecked `var()` strings, and `composes` is the whole composition story. That layer is exactly what Arvia adds: CSS Modules concept Arvia equivalent .button { } in button.module.css `component Button { }` in button.arv styles.button in JSX `Button().root` — same idea, typed composes: focusable from "./shared.css" `use Focusable;` — resolved through the shared theme, no path :global(.third-party) { } `global { .third-party { } }` var(--space-2) + a variables.css `space.2` — checked, with did-you-mean fixes clsx(styles.button, isLarge && styles.large) `Button({ size: "lg" })` — variants replace the conditional logic The migration in one example card.module.css + Card.tsx (before) .card { border: 1px solid var(--border); border-radius: 12px; padding: 20px; }\n.cardSelected { border-color: var(--accent); }\n.cardCompact { padding: 8px; }\n.title { font-weight: 600; }\n\n/* Card.tsx */\n/* <div className={clsx(styles.card,\n       selected && styles.cardSelected,\n       compact && styles.cardCompact)}> */ card.arv (after) component Card {\n  slots {\n    root {}\n    title { font-weight: 600; }\n  }\n\n  base {\n    border: 1px solid color.border;\n    border-radius: radius.lg;\n  }\n\n  variants {\n    selected {\n      no {}\n      yes { border-color: color.accent; }\n    }\n    density {\n      normal { padding: space.5; }\n      compact { padding: space.2; }\n    }\n  }\n\n  defaults { selected: no; density: normal; }\n}\n\n// Card({ selected: selected ? "yes" : "no", density }).root The modifier-class pattern (`.cardSelected`, `.cardCompact`) becomes variants: the combination logic leaves your component code, misspelling a modifier becomes a type error, and the title\'s class arrives from the same call instead of a second `styles.title` lookup. What carries over unchanged The mental model: styles in files next to components, imported as named values, scoped by generated class names. Plain CSS knowledge — every declaration inside a block is ordinary CSS, and `&:hover` works like CSS nesting. Single classes without ceremony: a `style` declaration is the moral equivalent of one CSS Modules class (see [Styles](/docs/styles)). What to watch out for No descendant selectors between your own elements — `.card .title { }` becomes a `title` slot. Selectors that reach into markup you don\'t own stay possible via `& .child` states and `global`. Composition is by name, not by path: `use Surface` resolves through the [shared theme](/docs/recipes), so shared fragments live in theme.arv rather than an imported shared.css. Media queries move from the stylesheet into [responsive](/docs/responsive) and [container](/docs/container-queries) blocks — declared per component, switching variants instead of raw properties.',
};

export function FromCssModulesPage() {
  return (
    <DocArticle meta={from_css_modulesMeta}>
      <DocP>
        <fbt desc="Docs content — cssm: opening">
          {
            "CSS Modules users already live the Arvia workflow: styles in a sibling file, scoped class names, an import that yields classes. What CSS Modules never had is knowledge of your design system — variants live in JS conditionals, tokens are unchecked `var()` strings, and `composes` is the whole composition story. That layer is exactly what Arvia adds:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — cssm concept">{"CSS Modules concept"}</fbt>,
          <fbt desc="Docs table header — cssm arvia equivalent">{"Arvia equivalent"}</fbt>,
        ]}
        rows={[
          [
            ".button { } in button.module.css",
            <fbt desc="Docs table cell — cssm class arvia">
              {"`component Button { }` in button.arv"}
            </fbt>,
          ],
          [
            "styles.button in JSX",
            <fbt desc="Docs table cell — cssm usage arvia">
              {"`Button().root` — same idea, typed"}
            </fbt>,
          ],
          [
            'composes: focusable from "./shared.css"',
            <fbt desc="Docs table cell — cssm composes arvia">
              {"`use Focusable;` — resolved through the shared theme, no path"}
            </fbt>,
          ],
          [
            ":global(.third-party) { }",
            <fbt desc="Docs table cell — cssm global arvia">{"`global { .third-party { } }`"}</fbt>,
          ],
          [
            "var(--space-2) + a variables.css",
            <fbt desc="Docs table cell — cssm vars arvia">
              {"`space.2` — checked, with did-you-mean fixes"}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — cssm clsx">
              {"clsx(styles.button, isLarge && styles.large)"}
            </fbt>,
            <fbt desc="Docs table cell — cssm clsx arvia">
              {'`Button({ size: "lg" })` — variants replace the conditional logic'}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: cssm example">{"The migration in one example"}</fbt>
      </DocH2>
      <DocCode
        label={"card.module.css + Card.tsx (before)"}
        lang={"css"}
        code={`.card { border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.cardSelected { border-color: var(--accent); }
.cardCompact { padding: 8px; }
.title { font-weight: 600; }

/* Card.tsx */
/* <div className={clsx(styles.card,
       selected && styles.cardSelected,
       compact && styles.cardCompact)}> */`}
      />
      <DocCode
        label={"card.arv (after)"}
        code={`component Card {
  slots {
    root {}
    title { font-weight: 600; }
  }

  base {
    border: 1px solid color.border;
    border-radius: radius.lg;
  }

  variants {
    selected {
      no {}
      yes { border-color: color.accent; }
    }
    density {
      normal { padding: space.5; }
      compact { padding: space.2; }
    }
  }

  defaults { selected: no; density: normal; }
}

// Card({ selected: selected ? "yes" : "no", density }).root`}
      />
      <DocP>
        <fbt desc="Docs content — cssm: example explanation">
          {
            "The modifier-class pattern (`.cardSelected`, `.cardCompact`) becomes variants: the combination logic leaves your component code, misspelling a modifier becomes a type error, and the title's class arrives from the same call instead of a second `styles.title` lookup."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: cssm carries over">{"What carries over unchanged"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — cssm carry model">
            {
              "The mental model: styles in files next to components, imported as named values, scoped by generated class names."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — cssm carry css">
            {
              "Plain CSS knowledge — every declaration inside a block is ordinary CSS, and `&:hover` works like CSS nesting."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — cssm carry styles">
            {
              "Single classes without ceremony: a `style` declaration is the moral equivalent of one CSS Modules class (see [Styles](/docs/styles))."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: cssm gotchas">{"What to watch out for"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — cssm gotcha descendant">
            {
              "No descendant selectors between your own elements — `.card .title { }` becomes a `title` slot. Selectors that reach into markup you don't own stay possible via `& .child` states and `global`."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — cssm gotcha composes">
            {
              "Composition is by name, not by path: `use Surface` resolves through the [shared theme](/docs/recipes), so shared fragments live in theme.arv rather than an imported shared.css."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — cssm gotcha media">
            {
              "Media queries move from the stylesheet into [responsive](/docs/responsive) and [container](/docs/container-queries) blocks — declared per component, switching variants instead of raw properties."
            }
          </fbt>
        </DocLi>
      </DocUl>
    </DocArticle>
  );
}
