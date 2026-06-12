import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const statesMeta: DocPageMeta = {
  slug: "states",
  title: <fbt desc="Docs page title — States">{"States"}</fbt>,
  description: (
    <fbt desc="Docs page description — Pseudo-classes, combinators, and group hover.">
      {"Pseudo-classes, combinators, attribute selectors, and group hover."}
    </fbt>
  ),
  nav: { section: "language", order: 15 },
  searchText:
    'An `&-block` attaches a selector suffix to whatever the surrounding context styles. The & stands for “the element this rule targets” — write anything CSS accepts after it: component Button {\n  base {\n    background: color.primary;\n\n    &:hover, &:focus-visible {\n      filter: brightness(1.05);\n    }\n\n    &:active {\n      transform: translateY(1px);\n    }\n\n    &:disabled {\n      opacity: 0.5;\n      cursor: not-allowed;\n    }\n\n    &::after {\n      content: "";\n    }\n  }\n} Selector lists expand per part — the first block above emits one rule with .Button_root_…:hover and .Button_root_…:focus-visible. Commas inside parentheses and brackets are respected, so &:not(:disabled, .off) and &[data-x="a,b"] split correctly. The suffix grammar There is no whitelist of pseudo-classes — the text after & passes to the browser. Whitespace after & is significant, which gives you the full family of CSS relationships: Pattern Meaning Compiles to &:hover Pseudo-class on the element itself .X_root_h:hover &::before Pseudo-element .X_root_h::before &.active Compound with another class (no gap) .X_root_h.active &[aria-expanded="true"] Attribute selector .X_root_h[aria-expanded="true"] & .child Descendant (gap after &) .X_root_h .child & > svg Direct child .X_root_h > svg &:not(:disabled):hover Chained and functional pseudo-classes .X_root_h:not(:disabled):hover &.active and & .active are different rules — compound versus descendant. The single space is the whole difference, exactly as in CSS nesting. Where states work States attach to every styling context: base, slot blocks, variant values, compound slot blocks, recipes, and styles. The condition scopes naturally — a state in a variant value only exists when that variant is active: component Button {\n  slots { root {} icon {} }\n\n  base {\n    &:hover { filter: brightness(1.03); }     // any button\n    icon {\n      &:hover { transform: rotate(8deg); }     // hovering the icon itself\n    }\n  }\n\n  variants {\n    tone {\n      danger {\n        &:hover { filter: brightness(1.1); }   // hover while danger\n      }\n    }\n  }\n} Group hover: states across slots Inside base and variant bodies, a state block may contain slot blocks — “when the root matches this selector, style that slot.” This is the group-hover pattern, with no extra classes to manage: component Button {\n  slots { root {} icon {} }\n\n  base {\n    &:hover {\n      opacity: 0.95;                            // the root itself\n      icon { transform: translateX(2px); }      // the icon, on root hover\n    }\n  }\n} generated CSS .Button_root_0p4oom:hover {\n  opacity: 0.95;\n}\n\n.Button_root_0p4oom:hover .Button_icon_0p4oom {\n  transform: translateX(2px);\n} The slot is targeted through its base class, which is always present — the rule fires whatever variants are active. From a variant body, the same construct scopes to that variant: tone danger\'s `&:hover` { icon { … } } compiles against .Button_tone_danger_root_…:hover. Slot blocks inside states are only legal in base and variant bodies — a recipe or style has no slots to refer to, so the checker rejects them there. And use is not allowed inside a state block; inline the declarations. Styling by ARIA and data attributes Because the suffix is free-form, the accessibility-first patterns work directly — keep state in the DOM attributes you already set, and let CSS follow: component Tab {\n  base {\n    color: color.muted;\n\n    &[aria-selected="true"] {\n      color: color.text;\n      border-bottom: 2px solid color.primary;\n    }\n\n    &[data-dragging] {\n      opacity: 0.5;\n    }\n  }\n} Attribute states and variants overlap: both express “this element is selected.” Prefer the attribute when the browser or your framework already maintains it (aria-selected, :disabled); prefer a variant when it is app state that TypeScript should see.',
};

export function StatesPage() {
  return (
    <DocArticle meta={statesMeta}>
      <DocP>
        <fbt desc="Docs content — states: opening">
          {
            "An `&-block` attaches a selector suffix to whatever the surrounding context styles. The & stands for “the element this rule targets” — write anything CSS accepts after it:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Button {
  base {
    background: color.primary;

    &:hover, &:focus-visible {
      filter: brightness(1.05);
    }

    &:active {
      transform: translateY(1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &::after {
      content: "";
    }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — states: selector lists">
          {
            'Selector lists expand per part — the first block above emits one rule with .Button_root_…:hover and .Button_root_…:focus-visible. Commas inside parentheses and brackets are respected, so &:not(:disabled, .off) and &[data-x="a,b"] split correctly.'
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: suffix grammar">{"The suffix grammar"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — states: grammar lead-in">
          {
            "There is no whitelist of pseudo-classes — the text after & passes to the browser. Whitespace after & is significant, which gives you the full family of CSS relationships:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — pattern">{"Pattern"}</fbt>,
          <fbt desc="Docs table header — meaning">{"Meaning"}</fbt>,
          <fbt desc="Docs table header — compiles to">{"Compiles to"}</fbt>,
        ]}
        rows={[
          [
            "&:hover",
            <fbt desc="Docs table cell — states pseudo">
              {"Pseudo-class on the element itself"}
            </fbt>,
            ".X_root_h:hover",
          ],
          [
            "&::before",
            <fbt desc="Docs table cell — states pseudo-element">{"Pseudo-element"}</fbt>,
            ".X_root_h::before",
          ],
          [
            "&.active",
            <fbt desc="Docs table cell — states compound class">
              {"Compound with another class (no gap)"}
            </fbt>,
            ".X_root_h.active",
          ],
          [
            '&[aria-expanded="true"]',
            <fbt desc="Docs table cell — states attribute">{"Attribute selector"}</fbt>,
            '.X_root_h[aria-expanded="true"]',
          ],
          [
            "& .child",
            <fbt desc="Docs table cell — states descendant">{"Descendant (gap after &)"}</fbt>,
            ".X_root_h .child",
          ],
          [
            "& > svg",
            <fbt desc="Docs table cell — states child">{"Direct child"}</fbt>,
            ".X_root_h > svg",
          ],
          [
            "&:not(:disabled):hover",
            <fbt desc="Docs table cell — states chained">
              {"Chained and functional pseudo-classes"}
            </fbt>,
            ".X_root_h:not(:disabled):hover",
          ],
        ]}
      />
      <DocCallout tone="warning">
        <fbt desc="Docs note — states: whitespace significant">
          {
            "&.active and & .active are different rules — compound versus descendant. The single space is the whole difference, exactly as in CSS nesting."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: where states work">{"Where states work"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — states: contexts lead-in">
          {
            "States attach to every styling context: base, slot blocks, variant values, compound slot blocks, recipes, and styles. The condition scopes naturally — a state in a variant value only exists when that variant is active:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Button {
  slots { root {} icon {} }

  base {
    &:hover { filter: brightness(1.03); }     // any button
    icon {
      &:hover { transform: rotate(8deg); }     // hovering the icon itself
    }
  }

  variants {
    tone {
      danger {
        &:hover { filter: brightness(1.1); }   // hover while danger
      }
    }
  }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: group hover">{"Group hover: states across slots"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — states: group hover lead-in">
          {
            "Inside base and variant bodies, a state block may contain slot blocks — “when the root matches this selector, style that slot.” This is the group-hover pattern, with no extra classes to manage:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Button {
  slots { root {} icon {} }

  base {
    &:hover {
      opacity: 0.95;                            // the root itself
      icon { transform: translateX(2px); }      // the icon, on root hover
    }
  }
}`}
      />
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`.Button_root_0p4oom:hover {
  opacity: 0.95;
}

.Button_root_0p4oom:hover .Button_icon_0p4oom {
  transform: translateX(2px);
}`}
      />
      <DocP>
        <fbt desc="Docs content — states: group hover semantics">
          {
            "The slot is targeted through its base class, which is always present — the rule fires whatever variants are active. From a variant body, the same construct scopes to that variant: tone danger's `&:hover` { icon { … } } compiles against .Button_tone_danger_root_…:hover."
          }
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — states: restrictions">
          {
            "Slot blocks inside states are only legal in base and variant bodies — a recipe or style has no slots to refer to, so the checker rejects them there. And use is not allowed inside a state block; inline the declarations."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: aria data">{"Styling by ARIA and data attributes"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — states: aria lead-in">
          {
            "Because the suffix is free-form, the accessibility-first patterns work directly — keep state in the DOM attributes you already set, and let CSS follow:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Tab {
  base {
    color: color.muted;

    &[aria-selected="true"] {
      color: color.text;
      border-bottom: 2px solid color.primary;
    }

    &[data-dragging] {
      opacity: 0.5;
    }
  }
}`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — states: attribute vs variant">
          {
            "Attribute states and variants overlap: both express “this element is selected.” Prefer the attribute when the browser or your framework already maintains it (aria-selected, :disabled); prefer a variant when it is app state that TypeScript should see."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
