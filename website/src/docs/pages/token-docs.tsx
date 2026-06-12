import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const token_docsMeta: DocPageMeta = {
  slug: "token-docs",
  title: <fbt desc="Docs page title — Token docs">{"Token docs"}</fbt>,
  description: (
    <fbt desc="Docs page description — Document tokens for designers and developers.">
      {"Attach documentation to tokens — it follows them into editors, types, and catalogs."}
    </fbt>
  ),
  nav: { section: "language", order: 19 },
  searchText:
    'A token\'s name says what it is; a doc string says when to use it. Append doc "…" to any token value: src/theme.arv theme {\n  color {\n    primary = #635bff doc "Brand primary — CTAs and links";\n    danger = #e5484d doc "Destructive actions only; pair with confirmation";\n    surface = #ffffff doc "Default card and panel background";\n  }\n\n  space {\n    1 = 4px doc "Hairline gaps: icon-to-label, badge padding";\n    4 = 16px doc "Default block spacing";\n  }\n} Where the docs surface Editor hover — the language server shows the doc string together with the token\'s value (and per-mode values) wherever the token is referenced. Generated types — doc strings become JSDoc on the tokens export, so tokens.`color.primary` carries its documentation into TypeScript autocomplete. Token catalogs — `arvia gen --docs` renders a browsable reference from the same strings. generated .d.ts (excerpt) export declare const tokens: {\n  readonly color: {\n    /** Brand primary — CTAs and links */\n    readonly primary: string;\n  };\n}; Generating a catalog terminal arvia gen --docs --theme src/theme.arv --out docs/tokens\n# or machine-readable:\narvia gen --docs --format json --theme src/theme.arv --out docs/tokens The Markdown output lists every group with names, values, mode overrides, and doc strings — ready for a design-system wiki. The JSON form feeds custom tooling: Figma sync, visual regression baselines, or a styleguide page that renders swatches. Writing docs worth reading Document the decision, not the value — “CTAs and links” helps; “purple” is already visible. State the boundary for near-duplicates: if muted and subtle coexist, their doc strings should say which to pick. Cover the scale\'s grammar once — a doc on `space.1` explaining the step logic teaches the whole group. Doc strings attach to theme tokens only. Component-local tokens are implementation details and never reach catalogs or exports — if a value deserves documentation for others, that is a sign it belongs in the theme.',
};

export function TokenDocsPage() {
  return (
    <DocArticle meta={token_docsMeta}>
      <DocP>
        <fbt desc="Docs content — token docs: opening">
          {
            'A token\'s name says what it is; a doc string says when to use it. Append doc "…" to any token value:'
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  color {
    primary = #635bff doc "Brand primary — CTAs and links";
    danger = #e5484d doc "Destructive actions only; pair with confirmation";
    surface = #ffffff doc "Default card and panel background";
  }

  space {
    1 = 4px doc "Hairline gaps: icon-to-label, badge padding";
    4 = 16px doc "Default block spacing";
  }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: where docs surface">{"Where the docs surface"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — token docs: hover">
            {
              "Editor hover — the language server shows the doc string together with the token's value (and per-mode values) wherever the token is referenced."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — token docs: jsdoc">
            {
              "Generated types — doc strings become JSDoc on the tokens export, so tokens.`color.primary` carries its documentation into TypeScript autocomplete."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — token docs: catalogs">
            {
              "Token catalogs — `arvia gen --docs` renders a browsable reference from the same strings."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocCode
        label={"generated .d.ts (excerpt)"}
        code={`export declare const tokens: {
  readonly color: {
    /** Brand primary — CTAs and links */
    readonly primary: string;
  };
};`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: generating catalog">{"Generating a catalog"}</fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`arvia gen --docs --theme src/theme.arv --out docs/tokens
# or machine-readable:
arvia gen --docs --format json --theme src/theme.arv --out docs/tokens`}
      />
      <DocP>
        <fbt desc="Docs content — token docs: catalog outputs">
          {
            "The Markdown output lists every group with names, values, mode overrides, and doc strings — ready for a design-system wiki. The JSON form feeds custom tooling: Figma sync, visual regression baselines, or a styleguide page that renders swatches."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: writing good docs">{"Writing docs worth reading"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — token docs: decision not value">
            {
              "Document the decision, not the value — “CTAs and links” helps; “purple” is already visible."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — token docs: boundaries">
            {
              "State the boundary for near-duplicates: if muted and subtle coexist, their doc strings should say which to pick."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — token docs: scale grammar">
            {
              "Cover the scale's grammar once — a doc on `space.1` explaining the step logic teaches the whole group."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocCallout tone="info">
        <fbt desc="Docs note — token docs: theme only">
          {
            "Doc strings attach to theme tokens only. Component-local tokens are implementation details and never reach catalogs or exports — if a value deserves documentation for others, that is a sign it belongs in the theme."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
