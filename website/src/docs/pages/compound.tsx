import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const compoundMeta: DocPageMeta = {
  slug: "compound",
  title: <fbt desc="Docs page title — Compound variants">{"Compound variants"}</fbt>,
  description: (
    <fbt desc="Docs page description — Styles that apply when multiple variants match.">
      {"Styles that apply only when several variant values line up."}
    </fbt>
  ),
  nav: { section: "language", order: 14 },
  searchText:
    'Variant axes are independent by design — but sometimes a combination needs its own treatment. A small danger button might need extra weight; a selected row that is also disabled needs muting. Compound blocks express exactly that: matchers naming variant values, plus slot styles that apply only when every matcher holds: component Button {\n  variants {\n    size { sm { padding: space.1 space.3; } lg { padding: space.3 space.5; } }\n    tone { primary { background: color.primary; } danger { background: color.danger; } }\n  }\n  defaults { size: lg; tone: primary; }\n\n  compound {\n    size: sm;\n    tone: danger;\n\n    root {\n      font-weight: 700;\n      text-transform: uppercase;\n      letter-spacing: 0.02em;\n    }\n  }\n} Matchers (size: sm;) and slot blocks (root { … }) share the compound body — the parser tells them apart by punctuation. A compound adds no props and no new API; it refines what existing props produce. Matching semantics At runtime, the generated function evaluates each variant to its effective value — the prop if passed, otherwise the default — and applies a compound\'s classes when all of its matchers equal those effective values. Defaults count: Button() with defaults size: sm, tone: danger does trigger the compound above without any props. what a call returns Button({ size: "sm", tone: "danger" }).root\n// "Button_root_… Button_size_sm_root_… Button_tone_danger_root_…\n//  Button_size_sm_tone_danger_root_…"   ← the compound class\n\nButton({ size: "sm" }).root\n// no compound class — tone resolves to its default "primary" With responsive object props, compounds match the static value — the initial entry (or default). A variant that only becomes sm at a breakpoint does not flip compounds on and off mid-media-query; combination styling stays predictable. Pushing it further Compounds compose along every dimension the language has. Multiple `compound` blocks stack — each matching one applies, in source order. A compound can match three or more axes, style several slots at once, and carry states: component Row {\n  slots { root {} title {} check {} }\n\n  variants {\n    selected { yes { background: color.primary; } no {} }\n    state    { enabled {} disabled { opacity: 0.6; } }\n    density  { normal {} compact { padding: space.1; } }\n  }\n  defaults { selected: no; state: enabled; density: normal; }\n\n  // selected rows get a visible check\n  compound {\n    selected: yes;\n    state: enabled;\n    check { opacity: 1; }\n  }\n\n  // selected + disabled: muted, not vivid\n  compound {\n    selected: yes;\n    state: disabled;\n\n    root { background: color.border; }\n    title { color: color.muted; }\n    check { opacity: 0.4; }\n  }\n\n  // three-axis: compact selected rows tighten the title too\n  compound {\n    selected: yes;\n    density: compact;\n    title { font-size: font.sm; }\n  }\n} A row that is selected, disabled, and compact matches the second and third blocks simultaneously and receives both class sets. Think of compounds as additive patches over the variant grid, not branches of an if/else. states inside a compound slot compound {\n  size: sm;\n  tone: danger;\n\n  root {\n    font-weight: 700;\n    &:hover { filter: brightness(1.1); }   // hover, only for sm + danger\n  }\n} Cascade position Compound classes are emitted after base and variant classes in the stylesheet and have the same single-class specificity — so when a compound and a variant set the same property, the compound wins. That ordering is the entire mechanism; there is no specificity arms race. Checked, like everything else Mistake Diagnostic Matcher names a variant the component lacks ARV121 Matcher names a value the axis lacks ARV122 Same variant matched twice in one block ARV126 Empty compound (no matchers or no styles) ARV123 — a warning; compilation continues. If you keep writing the same pair of matchers, that pair probably wants to be a real axis. Compounds shine for exceptions; when a combination is the rule, model it directly as a variant.',
};

export function CompoundPage() {
  return (
    <DocArticle meta={compoundMeta}>
      <DocP>
        <fbt desc="Docs content — compound: opening">
          {
            "Variant axes are independent by design — but sometimes a combination needs its own treatment. A small danger button might need extra weight; a selected row that is also disabled needs muting. Compound blocks express exactly that: matchers naming variant values, plus slot styles that apply only when every matcher holds:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Button {
  variants {
    size { sm { padding: space.1 space.3; } lg { padding: space.3 space.5; } }
    tone { primary { background: color.primary; } danger { background: color.danger; } }
  }
  defaults { size: lg; tone: primary; }

  compound {
    size: sm;
    tone: danger;

    root {
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — compound: syntax semantics">
          {
            "Matchers (size: sm;) and slot blocks (root { … }) share the compound body — the parser tells them apart by punctuation. A compound adds no props and no new API; it refines what existing props produce."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: matching semantics">{"Matching semantics"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — compound: matching against defaults">
          {
            "At runtime, the generated function evaluates each variant to its effective value — the prop if passed, otherwise the default — and applies a compound's classes when all of its matchers equal those effective values. Defaults count: Button() with defaults size: sm, tone: danger does trigger the compound above without any props."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"what a call returns"}
        lang={"js"}
        code={`Button({ size: "sm", tone: "danger" }).root
// "Button_root_… Button_size_sm_root_… Button_tone_danger_root_…
//  Button_size_sm_tone_danger_root_…"   ← the compound class

Button({ size: "sm" }).root
// no compound class — tone resolves to its default "primary"`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — compound: responsive matching">
          {
            "With responsive object props, compounds match the static value — the initial entry (or default). A variant that only becomes sm at a breakpoint does not flip compounds on and off mid-media-query; combination styling stays predictable."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: pushing further">{"Pushing it further"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — compound: pushing lead-in">
          {
            "Compounds compose along every dimension the language has. Multiple `compound` blocks stack — each matching one applies, in source order. A compound can match three or more axes, style several slots at once, and carry states:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Row {
  slots { root {} title {} check {} }

  variants {
    selected { yes { background: color.primary; } no {} }
    state    { enabled {} disabled { opacity: 0.6; } }
    density  { normal {} compact { padding: space.1; } }
  }
  defaults { selected: no; state: enabled; density: normal; }

  // selected rows get a visible check
  compound {
    selected: yes;
    state: enabled;
    check { opacity: 1; }
  }

  // selected + disabled: muted, not vivid
  compound {
    selected: yes;
    state: disabled;

    root { background: color.border; }
    title { color: color.muted; }
    check { opacity: 0.4; }
  }

  // three-axis: compact selected rows tighten the title too
  compound {
    selected: yes;
    density: compact;
    title { font-size: font.sm; }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — compound: additive patches">
          {
            "A row that is selected, disabled, and compact matches the second and third blocks simultaneously and receives both class sets. Think of compounds as additive patches over the variant grid, not branches of an if/else."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"states inside a compound slot"}
        code={`compound {
  size: sm;
  tone: danger;

  root {
    font-weight: 700;
    &:hover { filter: brightness(1.1); }   // hover, only for sm + danger
  }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: compound cascade">{"Cascade position"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — compound: cascade">
          {
            "Compound classes are emitted after base and variant classes in the stylesheet and have the same single-class specificity — so when a compound and a variant set the same property, the compound wins. That ordering is the entire mechanism; there is no specificity arms race."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: compound checks">{"Checked, like everything else"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="Docs table header — mistake">{"Mistake"}</fbt>,
          <fbt desc="Docs table header — diagnostic">{"Diagnostic"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — compound err1">
              {"Matcher names a variant the component lacks"}
            </fbt>,
            "ARV121",
          ],
          [
            <fbt desc="Docs table cell — compound err2">
              {"Matcher names a value the axis lacks"}
            </fbt>,
            "ARV122",
          ],
          [
            <fbt desc="Docs table cell — compound err3">
              {"Same variant matched twice in one block"}
            </fbt>,
            "ARV126",
          ],
          [
            <fbt desc="Docs table cell — compound err4">
              {"Empty compound (no matchers or no styles)"}
            </fbt>,
            <fbt desc="Docs table cell — compound err4 result">
              {"ARV123 — a warning; compilation continues."}
            </fbt>,
          ],
        ]}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — compound: when to promote">
          {
            "If you keep writing the same pair of matchers, that pair probably wants to be a real axis. Compounds shine for exceptions; when a combination is the rule, model it directly as a variant."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
