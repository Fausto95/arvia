import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const responsiveMeta: DocPageMeta = {
  slug: "responsive",
  title: <fbt desc="Docs page title — Responsive">{"Responsive"}</fbt>,
  description: (
    <fbt desc="Docs page description — Breakpoint-driven variant overrides.">
      {"Breakpoint-driven variant switching — declared in the component or at the call site."}
    </fbt>
  ),
  nav: { section: "language", order: 16 },
  searchText:
    'Responsive behavior in Arvia is variant switching: instead of writing media queries by hand, you say which variant value applies from which breakpoint up. Breakpoints are tokens, declared once in the theme: src/theme.arv theme {\n  breakpoint {\n    md = 768px;\n    lg = 1024px;\n  }\n} button.arv component Button {\n  variants {\n    size {\n      sm { padding: space.1 space.3; }\n      lg { padding: space.3 space.5; }\n    }\n  }\n\n  defaults { size: sm; }\n\n  responsive {\n    md { size: lg; }    // from 768px up, default to lg\n  }\n} Read the `responsive` block as overrides to defaults: below 768px a prop-less Button is sm; at 768px and above it becomes lg. Everything is mobile-first min-width — declare the small state as the default and step upward. generated CSS .Button_size_sm_root_0tbkbv { padding: 4px 12px; }\n.Button_size_lg_root_0tbkbv { padding: 16px 20px; }\n\n@media (min-width: 768px) {\n.Button_size_lg_bp_md_root_0tbkbv { padding: 16px 20px; }\n} The breakpoint variant gets its own media-wrapped class (note the bp_md segment). The component function attaches it alongside the initial value\'s class; the media query decides which one is visible. No JavaScript runs on resize — the browser does all the switching. Call-site control Callers get the same power through object props. Any variant covered by a `responsive` block accepts either a plain value or an object with an initial value and per-breakpoint overrides: App.tsx Button({ size: "sm" });                          // fixed — never switches\nButton({ size: { initial: "sm", md: "lg" } });   // switches at 768px\nButton();                                        // defaults + responsive block generated .d.ts export type ButtonProps = {\n  size?: "sm" | "lg" | { initial?: "sm" | "lg"; md?: "sm" | "lg"; };\n}; The interplay between the two layers is worth stating precisely — passing a prop takes full control of that variant: Call Below md At md and up Button() sm (default) lg (`responsive` block) Button({ size: "sm" }) sm sm — an explicit prop switches the `responsive` block off for that variant Button({ size: { initial: "sm", md: "lg" } }) sm lg The object form\'s breakpoint keys come from the component\'s `responsive` block — they are what generated the media-wrapped classes. A breakpoint/value pair the component never declared has no CSS behind it, so declare in the `responsive` block whatever you want callers to use. Several axes, several breakpoints component Nav {\n  variants {\n    layout { rail { width: 64px; } full { width: 240px; } }\n    labels { hidden { label { display: none; } } shown {} }\n  }\n\n  slots { root {} label {} }\n  defaults { layout: rail; labels: hidden; }\n\n  responsive {\n    md { layout: full; }\n    lg { labels: shown; }\n  }\n} Each entry maps one breakpoint to one or more variant overrides; different axes can switch at different widths. An unknown breakpoint name is an error pointing you to the theme (ARV141). Viewport or container? Responsive blocks answer “how wide is the screen?” — the right question for page-level layout: navigation, grids, gutters. For a component that must adapt to wherever it is dropped — a card in a sidebar versus the same card in the main column — ask “how wide am I?” instead, with a `container` block. The two compose freely in one component; see [Container queries](/docs/container-queries).',
};

export function ResponsivePage() {
  return (
    <DocArticle meta={responsiveMeta}>
      <DocP>
        <fbt desc="Docs content — responsive: opening">
          {
            "Responsive behavior in Arvia is variant switching: instead of writing media queries by hand, you say which variant value applies from which breakpoint up. Breakpoints are tokens, declared once in the theme:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  breakpoint {
    md = 768px;
    lg = 1024px;
  }
}`}
      />
      <DocCode
        label={"button.arv"}
        code={`component Button {
  variants {
    size {
      sm { padding: space.1 space.3; }
      lg { padding: space.3 space.5; }
    }
  }

  defaults { size: sm; }

  responsive {
    md { size: lg; }    // from 768px up, default to lg
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — responsive: author-time semantics">
          {
            "Read the `responsive` block as overrides to defaults: below 768px a prop-less Button is sm; at 768px and above it becomes lg. Everything is mobile-first min-width — declare the small state as the default and step upward."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`.Button_size_sm_root_0tbkbv { padding: 4px 12px; }
.Button_size_lg_root_0tbkbv { padding: 16px 20px; }

@media (min-width: 768px) {
.Button_size_lg_bp_md_root_0tbkbv { padding: 16px 20px; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — responsive: generated css explanation">
          {
            "The breakpoint variant gets its own media-wrapped class (note the bp_md segment). The component function attaches it alongside the initial value's class; the media query decides which one is visible. No JavaScript runs on resize — the browser does all the switching."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: call-site control">{"Call-site control"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — responsive: object props lead-in">
          {
            "Callers get the same power through object props. Any variant covered by a `responsive` block accepts either a plain value or an object with an initial value and per-breakpoint overrides:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`Button({ size: "sm" });                          // fixed — never switches
Button({ size: { initial: "sm", md: "lg" } });   // switches at 768px
Button();                                        // defaults + responsive block`}
      />
      <DocCode
        label={"generated .d.ts"}
        code={`export type ButtonProps = {
  size?: "sm" | "lg" | { initial?: "sm" | "lg"; md?: "sm" | "lg"; };
};`}
      />
      <DocP>
        <fbt desc="Docs content — responsive: interplay lead-in">
          {
            "The interplay between the two layers is worth stating precisely — passing a prop takes full control of that variant:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — call">{"Call"}</fbt>,
          <fbt desc="Docs table header — below md">{"Below md"}</fbt>,
          <fbt desc="Docs table header — at md and up">{"At md and up"}</fbt>,
        ]}
        rows={[
          [
            "Button()",
            <fbt desc="Docs table cell — responsive r1 below">{"sm (default)"}</fbt>,
            <fbt desc="Docs table cell — responsive r1 above">{"lg (`responsive` block)"}</fbt>,
          ],
          [
            'Button({ size: "sm" })',
            "sm",
            <fbt desc="Docs table cell — responsive r2 above">
              {"sm — an explicit prop switches the `responsive` block off for that variant"}
            </fbt>,
          ],
          ['Button({ size: { initial: "sm", md: "lg" } })', "sm", "lg"],
        ]}
      />
      <DocCallout tone="warning">
        <fbt desc="Docs note — responsive: keys from block">
          {
            "The object form's breakpoint keys come from the component's `responsive` block — they are what generated the media-wrapped classes. A breakpoint/value pair the component never declared has no CSS behind it, so declare in the `responsive` block whatever you want callers to use."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: several axes">{"Several axes, several breakpoints"}</fbt>
      </DocH2>
      <DocCode
        code={`component Nav {
  variants {
    layout { rail { width: 64px; } full { width: 240px; } }
    labels { hidden { label { display: none; } } shown {} }
  }

  slots { root {} label {} }
  defaults { layout: rail; labels: hidden; }

  responsive {
    md { layout: full; }
    lg { labels: shown; }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — responsive: multi axes semantics">
          {
            "Each entry maps one breakpoint to one or more variant overrides; different axes can switch at different widths. An unknown breakpoint name is an error pointing you to the theme (ARV141)."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: viewport or container">{"Viewport or container?"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — responsive: vs container">
          {
            "Responsive blocks answer “how wide is the screen?” — the right question for page-level layout: navigation, grids, gutters. For a component that must adapt to wherever it is dropped — a card in a sidebar versus the same card in the main column — ask “how wide am I?” instead, with a `container` block. The two compose freely in one component; see [Container queries](/docs/container-queries)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
