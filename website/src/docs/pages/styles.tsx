import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const stylesMeta: DocPageMeta = {
  slug: "styles",
  title: <fbt desc="Docs page title — Styles">{"Styles"}</fbt>,
  description: (
    <fbt desc="Docs page description — Standalone exported classes.">
      {"Standalone exported classes — utilities without component ceremony."}
    </fbt>
  ),
  nav: { section: "language", order: 9 },
  searchText:
    'Not everything deserves a component. A `style` declaration compiles to exactly one hashed CSS class and exports its name as a plain string constant — the right tool for one-off utilities, layout helpers, and page-level styling: utils.arv style truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nstyle visuallyHidden {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip-path: inset(50%);\n} App.tsx import { truncate, visuallyHidden } from "./utils.arv";\n\n<p className={truncate}>A very long line that should ellipsize…</p>\n<span className={visuallyHidden}>Screen-reader only label</span>\n\n// truncate === "truncate_0tgf3h" — just a string Style names become JavaScript exports, so they must be valid identifiers (camelCase by convention — ARV116 rejects my-util) and unique within the file, including against component names (ARV117). What styles can contain Styles support the full fragment feature set — declarations, token references, use, and `&-states` — everything except props and structure: style panel {\n  use Surface;\n  padding: space.4;\n\n  &:hover {\n    border-color: color.primary;\n  }\n} Variants and slots are deliberately rejected — the compiler error tells you to graduate to a component. That is the design line: a style is one class; the moment it needs a second flavor or a second element, it is a component with one variant or two slots. Composing with components Class strings concatenate, so styles layer cleanly on top of component slots: App.tsx import { Card } from "./card.arv";\nimport { truncate } from "./utils.arv";\n\nconst card = Card();\n\n<div className={card.root}>\n  <h3 className={`${card.title} ${truncate}`}>Long title that ellipsizes</h3>\n</div> Styles are emitted after components in the generated CSS — utilities last. With equal specificity, the utility wins the cascade, which is exactly what you want when truncate overrides a component\'s white-space. HMR guarantee Like components, a style\'s class name is hashed from the file path and name — not its declarations. Editing the declarations changes only the CSS output; the JS and type declarations stay byte-identical, so the dev server hot-swaps the stylesheet without re-running any of your modules.',
};

export function StylesPage() {
  return (
    <DocArticle meta={stylesMeta}>
      <DocP>
        <fbt desc="Docs content — styles: opening">
          {
            "Not everything deserves a component. A `style` declaration compiles to exactly one hashed CSS class and exports its name as a plain string constant — the right tool for one-off utilities, layout helpers, and page-level styling:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"utils.arv"}
        code={`style truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

style visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}`}
      />
      <DocCode
        label={"App.tsx"}
        code={`import { truncate, visuallyHidden } from "./utils.arv";

<p className={truncate}>A very long line that should ellipsize…</p>
<span className={visuallyHidden}>Screen-reader only label</span>

// truncate === "truncate_0tgf3h" — just a string`}
      />
      <DocP>
        <fbt desc="Docs content — styles: naming rules">
          {
            "Style names become JavaScript exports, so they must be valid identifiers (camelCase by convention — ARV116 rejects my-util) and unique within the file, including against component names (ARV117)."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: styles contents">{"What styles can contain"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — styles: contents lead-in">
          {
            "Styles support the full fragment feature set — declarations, token references, use, and `&-states` — everything except props and structure:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`style panel {
  use Surface;
  padding: space.4;

  &:hover {
    border-color: color.primary;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — styles: graduation">
          {
            "Variants and slots are deliberately rejected — the compiler error tells you to graduate to a component. That is the design line: a style is one class; the moment it needs a second flavor or a second element, it is a component with one variant or two slots."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: styles composing">{"Composing with components"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — styles: compose lead-in">
          {"Class strings concatenate, so styles layer cleanly on top of component slots:"}
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`import { Card } from "./card.arv";
import { truncate } from "./utils.arv";

const card = Card();

<div className={card.root}>
  <h3 className={\`\${card.title} \${truncate}\`}>Long title that ellipsizes</h3>
</div>`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — styles: utilities last">
          {
            "Styles are emitted after components in the generated CSS — utilities last. With equal specificity, the utility wins the cascade, which is exactly what you want when truncate overrides a component's white-space."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: styles hmr">{"HMR guarantee"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — styles: hmr">
          {
            "Like components, a style's class name is hashed from the file path and name — not its declarations. Editing the declarations changes only the CSS output; the JS and type declarations stay byte-identical, so the dev server hot-swaps the stylesheet without re-running any of your modules."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
