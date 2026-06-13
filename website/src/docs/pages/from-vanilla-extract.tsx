import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const from_vanilla_extractMeta: DocPageMeta = {
  slug: "from-vanilla-extract",
  title: (
    <fbt desc="Docs page title — Coming from vanilla-extract">{"Coming from vanilla-extract"}</fbt>
  ),
  description: (
    <fbt desc="Docs page description — Migrating from vanilla-extract.">
      {"Same zero-runtime philosophy, expressed as a language instead of a TypeScript API."}
    </fbt>
  ),
  nav: { section: "migrate", order: 2 },
  searchText:
    'vanilla-extract is Arvia\'s closest relative: build-time CSS, typed themes, a recipes API for variants. The shift is from describing styles with TypeScript values to describing them in a dedicated language — trading TS expressiveness inside style files for CSS-native syntax, a compiler with did-you-mean diagnostics, and slots/states without selector objects. The APIs map nearly one-to-one: vanilla-extract Arvia createGlobalTheme / createTheme `theme { }` — one shared theme, `modes:` for variants of it style({ … }) exported const `style name { }` — same concept, same export shape recipe({ base, variants, compoundVariants, defaultVariants }) `component` with `base` / `variants` / `compound` / `defaults` selectors: { "&:hover": { } } `&:hover { }` — selector syntax instead of object keys globalStyle("body", { }) `global { body { } }` keyframes({ from, to }) `keyframes name { from { } to { } }` — hashed the same way sprinkles(…) no direct equivalent — tokens + `style` utilities cover most uses @media keys in style objects `responsive { }` / `container { }` blocks switching variants recipe() → component, line by line button.css.ts (before) export const button = recipe({\n  base: { display: "inline-flex", gap: vars.space[2], borderRadius: vars.radius.md },\n  variants: {\n    size: {\n      sm: { padding: `${vars.space[1]} ${vars.space[3]}` },\n      lg: { padding: `${vars.space[3]} ${vars.space[5]}` },\n    },\n    tone: {\n      primary: { background: vars.color.primary },\n      danger: { background: vars.color.danger },\n    },\n  },\n  compoundVariants: [\n    { variants: { size: "sm", tone: "danger" }, style: { fontWeight: 700 } },\n  ],\n  defaultVariants: { size: "sm", tone: "primary" },\n}); button.arv (after) component Button {\n  base {\n    display: inline-flex;\n    gap: space.2;\n    border-radius: radius.md;\n  }\n\n  variants {\n    size {\n      sm { padding: space.1 space.3; }\n      lg { padding: space.3 space.5; }\n    }\n    tone {\n      primary { background: color.primary; }\n      danger  { background: color.danger; }\n    }\n  }\n\n  compound {\n    size: sm;\n    tone: danger;\n    root { font-weight: 700; }\n  }\n\n  defaults { size: sm; tone: primary; }\n} Every key found its block; the template-literal token plumbing (`vars.space[1]`) became plain references with compiler checking. The call site is identical in spirit — `button({ size: "lg" })` returned one class string; `Button({ size: "lg" })` returns one per slot, so multi-element components stop needing a second and third `style()` export. What Arvia adds on top [Slots](/docs/slots) — one definition styles root, icon, and label together, with cross-slot states (`&:hover { icon { … } }`) that recipes can\'t express without manual selectors. [Responsive](/docs/responsive) and [container](/docs/container-queries) variant switching, including the typed `{ initial, md, $wide }` call-site form. A language server: token hover with values, completion, go-to-definition, and did-you-mean fixes in `.arv` files — beyond what generic TS tooling sees inside style objects. What to watch out for No JavaScript inside style files: loops, helper functions, and computed style objects don\'t exist in `.arv`. Repetition is handled by [recipes](/docs/recipes) and [tokens](/docs/theme); anything truly dynamic moves to the call site (see the [FAQ](/docs/faq)). One shared theme contract instead of multiple `createTheme` instances: alternate themes are `modes:` on the same token set, switched with `data-arvia-theme` — not differently-shaped theme objects. Sprinkles-style atomic props have no direct counterpart. The common 80% — a constrained set of spacing/color values — is what tokens already enforce; for layout primitives, build a small `Box`-like component with variants.',
};

export function FromVanillaExtractPage() {
  return (
    <DocArticle meta={from_vanilla_extractMeta}>
      <DocP>
        <fbt desc="Docs content — ve: opening">
          {
            "vanilla-extract is Arvia's closest relative: build-time CSS, typed themes, a recipes API for variants. The shift is from describing styles with TypeScript values to describing them in a dedicated language — trading TS expressiveness inside style files for CSS-native syntax, a compiler with did-you-mean diagnostics, and slots/states without selector objects. The APIs map nearly one-to-one:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — ve concept">{"vanilla-extract"}</fbt>,
          <fbt desc="Docs table header — ve arvia">{"Arvia"}</fbt>,
        ]}
        rows={[
          [
            "createGlobalTheme / createTheme",
            <fbt desc="Docs table cell — ve theme arvia">
              {"`theme { }` — one shared theme, `modes:` for variants of it"}
            </fbt>,
          ],
          [
            "style({ … }) exported const",
            <fbt desc="Docs table cell — ve style arvia">
              {"`style name { }` — same concept, same export shape"}
            </fbt>,
          ],
          [
            "recipe({ base, variants, compoundVariants, defaultVariants })",
            <fbt desc="Docs table cell — ve recipe arvia">
              {"`component` with `base` / `variants` / `compound` / `defaults`"}
            </fbt>,
          ],
          [
            'selectors: { "&:hover": { } }',
            <fbt desc="Docs table cell — ve selectors arvia">
              {"`&:hover { }` — selector syntax instead of object keys"}
            </fbt>,
          ],
          [
            'globalStyle("body", { })',
            <fbt desc="Docs table cell — ve global arvia">{"`global { body { } }`"}</fbt>,
          ],
          [
            "keyframes({ from, to })",
            <fbt desc="Docs table cell — ve keyframes arvia">
              {"`keyframes name { from { } to { } }` — hashed the same way"}
            </fbt>,
          ],
          [
            "sprinkles(…)",
            <fbt desc="Docs table cell — ve sprinkles arvia">
              {"no direct equivalent — tokens + `style` utilities cover most uses"}
            </fbt>,
          ],
          [
            "@media keys in style objects",
            <fbt desc="Docs table cell — ve media arvia">
              {"`responsive { }` / `container { }` blocks switching variants"}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: ve recipe">{"recipe() → component, line by line"}</fbt>
      </DocH2>
      <DocCode
        label={"button.css.ts (before)"}
        code={`export const button = recipe({
  base: { display: "inline-flex", gap: vars.space[2], borderRadius: vars.radius.md },
  variants: {
    size: {
      sm: { padding: \`\${vars.space[1]} \${vars.space[3]}\` },
      lg: { padding: \`\${vars.space[3]} \${vars.space[5]}\` },
    },
    tone: {
      primary: { background: vars.color.primary },
      danger: { background: vars.color.danger },
    },
  },
  compoundVariants: [
    { variants: { size: "sm", tone: "danger" }, style: { fontWeight: 700 } },
  ],
  defaultVariants: { size: "sm", tone: "primary" },
});`}
      />
      <DocCode
        label={"button.arv (after)"}
        code={`component Button {
  base {
    display: inline-flex;
    gap: space.2;
    border-radius: radius.md;
  }

  variants {
    size {
      sm { padding: space.1 space.3; }
      lg { padding: space.3 space.5; }
    }
    tone {
      primary { background: color.primary; }
      danger  { background: color.danger; }
    }
  }

  compound {
    size: sm;
    tone: danger;
    root { font-weight: 700; }
  }

  defaults { size: sm; tone: primary; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — ve: recipe comparison">
          {
            'Every key found its block; the template-literal token plumbing (`vars.space[1]`) became plain references with compiler checking. The call site is identical in spirit — `button({ size: "lg" })` returned one class string; `Button({ size: "lg" })` returns one per slot, so multi-element components stop needing a second and third `style()` export.'
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: ve adds">{"What Arvia adds on top"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — ve adds slots">
            {
              "[Slots](/docs/slots) — one definition styles root, icon, and label together, with cross-slot states (`&:hover { icon { … } }`) that recipes can't express without manual selectors."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — ve adds responsive">
            {
              "[Responsive](/docs/responsive) and [container](/docs/container-queries) variant switching, including the typed `{ initial, md, $wide }` call-site form."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — ve adds lsp">
            {
              "A language server: token hover with values, completion, go-to-definition, and did-you-mean fixes in `.arv` files — beyond what generic TS tooling sees inside style objects."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: ve gotchas">{"What to watch out for"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — ve gotcha no js">
            {
              "No JavaScript inside style files: loops, helper functions, and computed style objects don't exist in `.arv`. Repetition is handled by [recipes](/docs/recipes) and [tokens](/docs/theme); anything truly dynamic moves to the call site (see the [FAQ](/docs/faq))."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — ve gotcha themes">
            {
              "One shared theme contract instead of multiple `createTheme` instances: alternate themes are `modes:` on the same token set, switched with `data-arvia-theme` — not differently-shaped theme objects."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — ve gotcha sprinkles">
            {
              "Sprinkles-style atomic props have no direct counterpart. The common 80% — a constrained set of spacing/color values — is what tokens already enforce; for layout primitives, build a small `Box`-like component with variants."
            }
          </fbt>
        </DocLi>
      </DocUl>
    </DocArticle>
  );
}
