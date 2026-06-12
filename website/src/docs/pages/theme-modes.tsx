import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const theme_modesMeta: DocPageMeta = {
  slug: "theme-modes",
  title: <fbt desc="Docs page title — Theme modes">{"Theme modes"}</fbt>,
  description: (
    <fbt desc="Docs page description — Light/dark theming with modes.">
      {"Light, dark, and beyond: mode-aware tokens with zero JavaScript."}
    </fbt>
  ),
  nav: { section: "language", order: 6 },
  searchText:
    'A `modes` declaration turns selected tokens into mode-aware CSS custom properties. Declare the modes once, then override any token per mode with an `@mode` block: src/theme.arv theme {\n  modes: light | dark;\n\n  color {\n    text = #111111;\n    background = #ffffff;\n    primary = #635bff;\n\n    @dark {\n      text = #eeeeee;\n      background = #111113;\n    }\n  }\n} The first mode in the list is the default — its values are the token declarations themselves. Tokens without an override (primary above) keep one value across all modes. Mode overrides live inside the group they affect, next to the values they replace. The generated CSS Modes compile to four kinds of rules — defaults on `:root`, an OS-preference media query, and one attribute selector per mode for manual control: generated CSS :root {\n  --arvia-color-text: #111111;\n  --arvia-color-background: #ffffff;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --arvia-color-text: #eeeeee;\n    --arvia-color-background: #111113;\n  }\n}\n\n[data-arvia-theme="light"] {\n  --arvia-color-text: #111111;\n  --arvia-color-background: #ffffff;\n}\n\n[data-arvia-theme="dark"] {\n  --arvia-color-text: #eeeeee;\n  --arvia-color-background: #111113;\n} Read the cascade: with no attribute set, the OS preference wins via the media query. Setting `data-arvia-theme` on the root element overrides it, because attribute selectors come later. Every style that references a moded token compiles to `var(`--arvia-color-…`)`, so the whole page reacts instantly to either signal — no re-render, no JavaScript theme context. A theme switcher Manual switching is one attribute write. A complete three-state switcher (system / light / dark) with persistence: theme-switcher.tsx type Mode = "system" | "light" | "dark";\n\nfunction applyMode(mode: Mode) {\n  if (mode === "system") {\n    delete document.documentElement.dataset.arviaTheme;\n  } else {\n    document.documentElement.dataset.arviaTheme = mode;\n  }\n  localStorage.setItem("theme", mode);\n}\n\n// On boot, before React renders (avoids a flash):\napplyMode((localStorage.getItem("theme") as Mode) ?? "system"); Removing the attribute returns control to `prefers-color-scheme` — that is your “system” setting for free. Run the boot line in a small inline script in index.html if you need to beat the first paint. More than two modes Modes are not limited to light and dark — declare as many as you need (high-contrast, dim, brand themes). Each gets its own `@mode` override blocks and attribute selector: theme {\n  modes: light | dark | dim;\n\n  color {\n    text = #111111;\n    @dark { text = #eeeeee; }\n    @dim  { text = #999999; }\n  }\n} Only a mode literally named dark participates in the `prefers-color-scheme` media query; other non-default modes are reachable through `data-arvia-theme` alone. The first mode remains the `:root` default either way. Which tokens become variables Once modes are declared, every theme token compiles to a CSS custom property and every reference to one becomes `var(…)` — including tokens that never vary, which keeps the output uniform and lets you add a mode override later without touching consumers. Two things stay inlined: component-local tokens (see [Local tokens](/docs/local-tokens)) and values in single-mode projects. Situation Result `@dark` override without a `modes` declaration Error ARV134 — declare `modes:` first. `@blue` override when modes are light | dark Error ARV132 — unknown theme mode. Mode override inside a component `tokens` block Rejected — moded values belong in the theme. The tokens export follows along: with modes enabled, tokens.color.text is the string "var(--arvia-color-text)", so values you pass to inline styles or charts flip with the mode automatically.',
};

export function ThemeModesPage() {
  return (
    <DocArticle meta={theme_modesMeta}>
      <DocP>
        <fbt desc="Docs content — modes: opening">
          {
            "A `modes` declaration turns selected tokens into mode-aware CSS custom properties. Declare the modes once, then override any token per mode with an `@mode` block:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  modes: light | dark;

  color {
    text = #111111;
    background = #ffffff;
    primary = #635bff;

    @dark {
      text = #eeeeee;
      background = #111113;
    }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — modes: basic semantics">
          {
            "The first mode in the list is the default — its values are the token declarations themselves. Tokens without an override (primary above) keep one value across all modes. Mode overrides live inside the group they affect, next to the values they replace."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: modes generated css">{"The generated CSS"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — modes: generated lead-in">
          {
            "Modes compile to four kinds of rules — defaults on `:root`, an OS-preference media query, and one attribute selector per mode for manual control:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`:root {
  --arvia-color-text: #111111;
  --arvia-color-background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --arvia-color-text: #eeeeee;
    --arvia-color-background: #111113;
  }
}

[data-arvia-theme="light"] {
  --arvia-color-text: #111111;
  --arvia-color-background: #ffffff;
}

[data-arvia-theme="dark"] {
  --arvia-color-text: #eeeeee;
  --arvia-color-background: #111113;
}`}
      />
      <DocP>
        <fbt desc="Docs content — modes: cascade explanation">
          {
            "Read the cascade: with no attribute set, the OS preference wins via the media query. Setting `data-arvia-theme` on the root element overrides it, because attribute selectors come later. Every style that references a moded token compiles to `var(`--arvia-color-…`)`, so the whole page reacts instantly to either signal — no re-render, no JavaScript theme context."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: theme switcher">{"A theme switcher"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — modes: switcher lead-in">
          {
            "Manual switching is one attribute write. A complete three-state switcher (system / light / dark) with persistence:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"theme-switcher.tsx"}
        code={`type Mode = "system" | "light" | "dark";

function applyMode(mode: Mode) {
  if (mode === "system") {
    delete document.documentElement.dataset.arviaTheme;
  } else {
    document.documentElement.dataset.arviaTheme = mode;
  }
  localStorage.setItem("theme", mode);
}

// On boot, before React renders (avoids a flash):
applyMode((localStorage.getItem("theme") as Mode) ?? "system");`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — modes: system setting tip">
          {
            "Removing the attribute returns control to `prefers-color-scheme` — that is your “system” setting for free. Run the boot line in a small inline script in index.html if you need to beat the first paint."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: more modes">{"More than two modes"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — modes: many modes lead-in">
          {
            "Modes are not limited to light and dark — declare as many as you need (high-contrast, dim, brand themes). Each gets its own `@mode` override blocks and attribute selector:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`theme {
  modes: light | dark | dim;

  color {
    text = #111111;
    @dark { text = #eeeeee; }
    @dim  { text = #999999; }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — modes: dark is special">
          {
            "Only a mode literally named dark participates in the `prefers-color-scheme` media query; other non-default modes are reachable through `data-arvia-theme` alone. The first mode remains the `:root` default either way."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: which tokens vars">
          {"Which tokens become variables"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — modes: which become vars">
          {
            "Once modes are declared, every theme token compiles to a CSS custom property and every reference to one becomes `var(…)` — including tokens that never vary, which keeps the output uniform and lets you add a mode override later without touching consumers. Two things stay inlined: component-local tokens (see [Local tokens](/docs/local-tokens)) and values in single-mode projects."
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — situation">{"Situation"}</fbt>,
          <fbt desc="Docs table header — result">{"Result"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — modes err1">
              {"`@dark` override without a `modes` declaration"}
            </fbt>,
            <fbt desc="Docs table cell — modes err1 result">
              {"Error ARV134 — declare `modes:` first."}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — modes err2">
              {"`@blue` override when modes are light | dark"}
            </fbt>,
            <fbt desc="Docs table cell — modes err2 result">
              {"Error ARV132 — unknown theme mode."}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — modes err3">
              {"Mode override inside a component `tokens` block"}
            </fbt>,
            <fbt desc="Docs table cell — modes err3 result">
              {"Rejected — moded values belong in the theme."}
            </fbt>,
          ],
        ]}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — modes: tokens export follows">
          {
            'The tokens export follows along: with modes enabled, tokens.color.text is the string "var(--arvia-color-text)", so values you pass to inline styles or charts flip with the mode automatically.'
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
