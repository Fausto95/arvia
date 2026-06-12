import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const local_tokensMeta: DocPageMeta = {
  slug: "local-tokens",
  title: <fbt desc="Docs page title — Local tokens">{"Local tokens"}</fbt>,
  description: (
    <fbt desc="Docs page description — Component-scoped tokens that shadow the theme.">
      {"Component-scoped values that shadow the theme."}
    </fbt>
  ),
  nav: { section: "language", order: 12 },
  searchText:
    "Some values matter to exactly one component: a chip's pill radius, a toolbar's precise height. A `tokens` block inside a component names those values without polluting the global theme: chip.arv component Chip {\n  tokens {\n    space { pad = 6px; }\n    metrics { radius = 999px; }\n  }\n\n  base {\n    padding: space.pad space.2;   // local pad, theme space.2\n    border-radius: metrics.radius;\n  }\n} References use the exact same group.name syntax — there is no separate way to write a local reference. Resolution checks the component's tokens first, then the file's `theme` block, then the shared theme. In the example, `space.pad` finds the local value while `space.2` falls through to the theme: one component can mix both in a single declaration. Shadowing Because local groups win lookups, redefining an existing theme token changes what it means inside this component only: theme { space { 2 = 8px; } }\n\ncomponent Dense {\n  tokens { space { 2 = 4px; } }   // tighter, here only\n  base { gap: space.2; }           // 4px\n}\n\ncomponent Normal {\n  base { gap: space.2; }           // 8px — no leak\n} Shadowing a theme token is powerful and easy to over-use — a reader seeing `space.2` will assume the theme value. Prefer a new name (`space.dense`) unless the component genuinely reinterprets the scale. Compile-time constants Local tokens are always inlined to literal values — even when the theme has modes and global tokens compile to CSS variables. They never become custom properties, never appear in the tokens export or the token catalog, and accept no `@mode` overrides (mode-dependent values belong in the theme). They resolve everywhere a value can appear, including `calc()` and state blocks: component Chip {\n  tokens { metrics { gap = 4px; } }\n\n  base {\n    margin: calc(metrics.gap * 3);   // calc(4px * 3)\n    &:hover { margin: metrics.gap; } // 4px\n  }\n\n  variants {\n    size {\n      lg { padding: calc(metrics.gap * 2); }\n    }\n  }\n} A local token that nothing references is flagged (ARV171) — local values have exactly one consumer, so an unused one is dead weight the checker can prove. Local or theme? Signal Put it in Two or more components need it Theme — that is the definition of a design token. It should flip with dark mode Theme — only theme tokens take `@mode` overrides. It is a magic number with a meaning, used once Component tokens — named, scoped, inlined. Designers should see it in the token catalog Theme — local tokens are invisible to tooling by design.",
};

export function LocalTokensPage() {
  return (
    <DocArticle meta={local_tokensMeta}>
      <DocP>
        <fbt desc="Docs content — local tokens: opening">
          {
            "Some values matter to exactly one component: a chip's pill radius, a toolbar's precise height. A `tokens` block inside a component names those values without polluting the global theme:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"chip.arv"}
        code={`component Chip {
  tokens {
    space { pad = 6px; }
    metrics { radius = 999px; }
  }

  base {
    padding: space.pad space.2;   // local pad, theme space.2
    border-radius: metrics.radius;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — local tokens: resolution order">
          {
            "References use the exact same group.name syntax — there is no separate way to write a local reference. Resolution checks the component's tokens first, then the file's `theme` block, then the shared theme. In the example, `space.pad` finds the local value while `space.2` falls through to the theme: one component can mix both in a single declaration."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: shadowing">{"Shadowing"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — local tokens: shadowing lead-in">
          {
            "Because local groups win lookups, redefining an existing theme token changes what it means inside this component only:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`theme { space { 2 = 8px; } }

component Dense {
  tokens { space { 2 = 4px; } }   // tighter, here only
  base { gap: space.2; }           // 4px
}

component Normal {
  base { gap: space.2; }           // 8px — no leak
}`}
      />
      <DocCallout tone="warning">
        <fbt desc="Docs note — local tokens: shadowing caution">
          {
            "Shadowing a theme token is powerful and easy to over-use — a reader seeing `space.2` will assume the theme value. Prefer a new name (`space.dense`) unless the component genuinely reinterprets the scale."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: compile-time constants">{"Compile-time constants"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — local tokens: constants semantics">
          {
            "Local tokens are always inlined to literal values — even when the theme has modes and global tokens compile to CSS variables. They never become custom properties, never appear in the tokens export or the token catalog, and accept no `@mode` overrides (mode-dependent values belong in the theme). They resolve everywhere a value can appear, including `calc()` and state blocks:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Chip {
  tokens { metrics { gap = 4px; } }

  base {
    margin: calc(metrics.gap * 3);   // calc(4px * 3)
    &:hover { margin: metrics.gap; } // 4px
  }

  variants {
    size {
      lg { padding: calc(metrics.gap * 2); }
    }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — local tokens: unused warning">
          {
            "A local token that nothing references is flagged (ARV171) — local values have exactly one consumer, so an unused one is dead weight the checker can prove."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: local or theme">{"Local or theme?"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="Docs table header — signal">{"Signal"}</fbt>,
          <fbt desc="Docs table header — put it in">{"Put it in"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — signal shared">{"Two or more components need it"}</fbt>,
            <fbt desc="Docs table cell — answer theme">
              {"Theme — that is the definition of a design token."}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — signal moded">{"It should flip with dark mode"}</fbt>,
            <fbt desc="Docs table cell — answer theme moded">
              {"Theme — only theme tokens take `@mode` overrides."}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — signal magic">
              {"It is a magic number with a meaning, used once"}
            </fbt>,
            <fbt desc="Docs table cell — answer local">
              {"Component tokens — named, scoped, inlined."}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — signal catalog">
              {"Designers should see it in the token catalog"}
            </fbt>,
            <fbt desc="Docs table cell — answer theme catalog">
              {"Theme — local tokens are invisible to tooling by design."}
            </fbt>,
          ],
        ]}
      />
    </DocArticle>
  );
}
