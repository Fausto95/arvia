import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const themeMeta: DocPageMeta = {
  slug: "theme",
  title: <fbt desc="Docs page title — Theme &amp;amp;amp; tokens">{"Theme & tokens"}</fbt>,
  description: (
    <fbt desc="Docs page description — Design tokens in depth.">
      {"Design tokens: groups, references, aliases, and how they reach every file."}
    </fbt>
  ),
  nav: { section: "language", order: 5 },
  searchText:
    'A `theme` block declares design tokens: named values organized into groups. Tokens are the vocabulary the rest of your styles are written in — every other construct references them with dot notation. src/theme.arv theme {\n  color {\n    primary = #635bff;\n    danger = #e5484d;\n  }\n  space {\n    1 = 4px;\n    2 = 8px;\n    4 = 16px;\n  }\n  radius { md = 8px; full = 999px; }\n  font { sm = 13px; md = 15px; }\n  duration { fast = 120ms; }\n  easing { out = cubic-bezier(0.16, 1, 0.3, 1); }\n  breakpoint { md = 768px; }\n  container { wide = 480px; }\n} Group names are yours to invent — color, space, and radius are conventions, not keywords. A token value is any CSS value text: lengths, colors, font stacks, cubic-bezier() curves, shadows. Token names may start with digits, which makes numeric scales like `space.1`, `space.2` natural to write. Two group names are special: breakpoint feeds `responsive` blocks and container feeds `container` blocks. They configure queries — they cannot be referenced as values and are not part of the tokens export. Referencing tokens Anywhere a CSS value appears — components, recipes, styles, global rules, keyframes — write group.name and the compiler substitutes the value. References work inside functions and shorthand values too: component Card {\n  base {\n    padding: space.2 space.4;\n    width: calc(space.4 * 10);\n    background: linear-gradient(color.primary, color.danger);\n    transition: opacity duration.fast easing.out;\n  }\n} References are checked. A typo like color.primry is a compile error (ARV101) with a did-you-mean suggestion and an automatic fix in the editor. Dots that do not start with a known group name — grid-area: main.start, url("a.b/img.png") — pass through untouched, so ordinary CSS never fights the checker. Token aliases A token value can reference earlier tokens, including from other groups. Use aliases to give semantic names to raw values, or to build composite tokens: theme {\n  color {\n    base = #111111;\n    text = color.base;\n  }\n  border {\n    thin = 1px solid color.base;\n  }\n} Aliases resolve at compile time — border.thin becomes 1px solid #111111 in the output. Chains are followed (a = b, b = c works), and aliases respect theme `modes:` an alias of a moded token carries both mode values. One rule: tokens must be defined before they are referenced; forward references are an error. How tokens reach every file The theme file configured in the Vite plugin (`src/theme.arv` by convention) is compiled first, and its tokens, recipes, and keyframes become the shared environment every other `.arv` file is checked against. That is why component files reference `color.primary` with no import — the theme is ambient, like a standard library. Other files can declare their own `theme` blocks too. File-level tokens extend the shared environment for that file only — useful for page-specific values — and a component\'s `tokens` block scopes values to a single component (see [Local tokens](/docs/local-tokens)). Within one file, declaring the same group twice or the same token twice is an error (ARV112), so there is always exactly one place a value lives. What tokens compile to In a single-mode theme (no `modes` declaration), every reference is inlined to its literal value — the CSS contains 8px, not a variable. Declare modes and the moded tokens become CSS custom properties named --arvia-<group>-<name>, switched by mode (see [Theme modes](/docs/theme-modes)): generated CSS (moded theme) :root {\n  --arvia-color-primary: #635bff;\n}\n\n.Button_root_0p4oom {\n  background: var(--arvia-color-primary);\n} Using tokens from TypeScript The theme file also exports its tokens as a typed object, for the occasional inline style, canvas drawing, or charting library. Values are literals in single-mode themes and `var()` references in moded themes — so they stay correct when the mode flips: App.tsx import { tokens } from "./theme.arv";\n\ntokens.color.primary;  // "#635bff" — or "var(--arvia-color-primary)" with modes\ntokens.space["2"];     // "8px"\n\n// Generated alongside: per-group key unions\nimport type { ColorToken } from "./theme.arv"; // "primary" | "danger" | … Only files that declare theme tokens export a tokens object — import it from your theme file, not from component files. A component or style named \'tokens\' in a theme file collides with the export and is rejected (ARV125). Designing a token scale Name by role where it pays off: `color.text` and `color.surface` survive a rebrand; `color.gray100` does not. Use digit-led names for ordered scales (`space.1` … `space.9`, `font.sm` … `font.3xl`) — they sort naturally and read like math. Document intent with doc strings — primary = #635bff doc "CTAs and links" — and the meaning shows up on hover in your editor (see [Token docs](/docs/token-docs)).',
};

export function ThemePage() {
  return (
    <DocArticle meta={themeMeta}>
      <DocP>
        <fbt desc="Docs content — theme: opening">
          {
            "A `theme` block declares design tokens: named values organized into groups. Tokens are the vocabulary the rest of your styles are written in — every other construct references them with dot notation."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  color {
    primary = #635bff;
    danger = #e5484d;
  }
  space {
    1 = 4px;
    2 = 8px;
    4 = 16px;
  }
  radius { md = 8px; full = 999px; }
  font { sm = 13px; md = 15px; }
  duration { fast = 120ms; }
  easing { out = cubic-bezier(0.16, 1, 0.3, 1); }
  breakpoint { md = 768px; }
  container { wide = 480px; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — theme: groups are free-form">
          {
            "Group names are yours to invent — color, space, and radius are conventions, not keywords. A token value is any CSS value text: lengths, colors, font stacks, cubic-bezier() curves, shadows. Token names may start with digits, which makes numeric scales like `space.1`, `space.2` natural to write."
          }
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — theme: special groups">
          {
            "Two group names are special: breakpoint feeds `responsive` blocks and container feeds `container` blocks. They configure queries — they cannot be referenced as values and are not part of the tokens export."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: referencing tokens">{"Referencing tokens"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — theme: referencing lead-in">
          {
            "Anywhere a CSS value appears — components, recipes, styles, global rules, keyframes — write group.name and the compiler substitutes the value. References work inside functions and shorthand values too:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Card {
  base {
    padding: space.2 space.4;
    width: calc(space.4 * 10);
    background: linear-gradient(color.primary, color.danger);
    transition: opacity duration.fast easing.out;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — theme: checked references">
          {
            'References are checked. A typo like color.primry is a compile error (ARV101) with a did-you-mean suggestion and an automatic fix in the editor. Dots that do not start with a known group name — grid-area: main.start, url("a.b/img.png") — pass through untouched, so ordinary CSS never fights the checker.'
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: token aliases">{"Token aliases"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — theme: aliases lead-in">
          {
            "A token value can reference earlier tokens, including from other groups. Use aliases to give semantic names to raw values, or to build composite tokens:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`theme {
  color {
    base = #111111;
    text = color.base;
  }
  border {
    thin = 1px solid color.base;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — theme: alias semantics">
          {
            "Aliases resolve at compile time — border.thin becomes 1px solid #111111 in the output. Chains are followed (a = b, b = c works), and aliases respect theme `modes:` an alias of a moded token carries both mode values. One rule: tokens must be defined before they are referenced; forward references are an error."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: global env">{"How tokens reach every file"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — theme: shared env">
          {
            "The theme file configured in the Vite plugin (`src/theme.arv` by convention) is compiled first, and its tokens, recipes, and keyframes become the shared environment every other `.arv` file is checked against. That is why component files reference `color.primary` with no import — the theme is ambient, like a standard library."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — theme: extension and duplicates">
          {
            "Other files can declare their own `theme` blocks too. File-level tokens extend the shared environment for that file only — useful for page-specific values — and a component's `tokens` block scopes values to a single component (see [Local tokens](/docs/local-tokens)). Within one file, declaring the same group twice or the same token twice is an error (ARV112), so there is always exactly one place a value lives."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: what tokens compile to">{"What tokens compile to"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — theme: compile single vs moded">
          {
            "In a single-mode theme (no `modes` declaration), every reference is inlined to its literal value — the CSS contains 8px, not a variable. Declare modes and the moded tokens become CSS custom properties named --arvia-<group>-<name>, switched by mode (see [Theme modes](/docs/theme-modes)):"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS (moded theme)"}
        lang={"css"}
        code={`:root {
  --arvia-color-primary: #635bff;
}

.Button_root_0p4oom {
  background: var(--arvia-color-primary);
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: tokens from ts">{"Using tokens from TypeScript"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — theme: tokens export lead-in">
          {
            "The theme file also exports its tokens as a typed object, for the occasional inline style, canvas drawing, or charting library. Values are literals in single-mode themes and `var()` references in moded themes — so they stay correct when the mode flips:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`import { tokens } from "./theme.arv";

tokens.color.primary;  // "#635bff" — or "var(--arvia-color-primary)" with modes
tokens.space["2"];     // "8px"

// Generated alongside: per-group key unions
import type { ColorToken } from "./theme.arv"; // "primary" | "danger" | …`}
      />
      <DocCallout tone="warning">
        <fbt desc="Docs note — theme: tokens export location">
          {
            "Only files that declare theme tokens export a tokens object — import it from your theme file, not from component files. A component or style named 'tokens' in a theme file collides with the export and is rejected (ARV125)."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: designing scales">{"Designing a token scale"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — theme: name by role">
            {
              "Name by role where it pays off: `color.text` and `color.surface` survive a rebrand; `color.gray100` does not."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — theme: digit scales">
            {
              "Use digit-led names for ordered scales (`space.1` … `space.9`, `font.sm` … `font.3xl`) — they sort naturally and read like math."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — theme: doc strings">
            {
              'Document intent with doc strings — primary = #635bff doc "CTAs and links" — and the meaning shows up on hover in your editor (see [Token docs](/docs/token-docs)).'
            }
          </fbt>
        </DocLi>
      </DocUl>
    </DocArticle>
  );
}
