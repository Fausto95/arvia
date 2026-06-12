import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const variantsMeta: DocPageMeta = {
  slug: "variants",
  title: (
    <fbt desc="Docs page title — Variants &amp;amp;amp; defaults">{"Variants & defaults"}</fbt>
  ),
  description: (
    <fbt desc="Docs page description — Prop-driven style branches with defaults.">
      {"Prop-driven style axes, defaults, and the types they generate."}
    </fbt>
  ),
  nav: { section: "language", order: 13 },
  searchText:
    'Variants are the props of a component. Each variant is an axis with named values; each value carries the styles that apply when a caller picks it: component Button {\n  variants {\n    size {\n      sm { padding: space.1 space.3; font-size: font.sm; }\n      md { padding: space.2 space.4; font-size: font.md; }\n      lg { padding: space.3 space.5; font-size: font.lg; }\n    }\n    tone {\n      primary { background: color.primary; color: white; }\n      danger  { background: color.danger; color: white; }\n      ghost   { background: transparent; color: color.muted; }\n    }\n  }\n\n  defaults {\n    size: md;\n    tone: primary;\n  }\n} App.tsx Button();                              // md + primary (defaults)\nButton({ size: "lg" });                // lg + primary\nButton({ size: "sm", tone: "ghost" }); // sm + ghost Axes are orthogonal: every size works with every tone, and the compiler generates one class per value per slot it touches — three sizes and three tones produce six classes, not nine combinations. Styling specific combinations is what `compound` blocks are for. Defaults and required props The `defaults` block does double duty: it picks the runtime fallback when a prop is omitted, and it decides the TypeScript signature. A variant with a default is an optional prop; a variant without one is required: component Tag {\n  variants {\n    tone { info {} danger {} }     // no default — callers must choose\n    size { sm {} md {} }\n  }\n  defaults { size: sm; }\n} generated .d.ts export type TagProps = {\n  tone: "info" | "danger";   // required\n  size?: "sm" | "md";        // optional\n};\n\nexport declare function Tag(props: TagProps): TagSlots; Leaving a variant default-less is a design statement — “there is no neutral choice here” — and the type system enforces it at every call site. At runtime, an omitted default-less variant simply contributes no class. The checker keeps defaults honest: referencing an unknown variant or value in defaults is an error with a fix (ARV124), an empty variant axis is flagged (ARV173), and duplicate axis or value names collide (ARV114). Variant values are full style bodies A value block is not limited to declarations — it can style slots, attach states, and pull in recipes, all scoped to that value: component Button {\n  slots { root {} icon {} }\n\n  variants {\n    tone {\n      primary {\n        background: color.primary;\n        &:hover { filter: brightness(1.06); }   // hover, primary only\n      }\n      danger {\n        use FocusRing;                           // recipe, danger only\n        background: color.danger;\n        icon { color: white; }                   // slot, danger only\n        &:hover { icon { transform: scale(1.1); } } // cross-slot state\n      }\n    }\n  }\n\n  defaults { tone: primary; }\n} Modeling boolean props Arvia has no boolean variant type — model on/off as a two-value axis. The names read better than true/false in both the `.arv` source and the call site, and they leave room for a third state later: component Field {\n  variants {\n    state {\n      idle {}\n      invalid {\n        border-color: color.danger;\n        &:focus-visible { outline-color: color.danger; }\n      }\n    }\n  }\n  defaults { state: idle; }\n}\n\n// Field({ state: invalid ? "invalid" : "idle" }) How variant classes stack The generated function concatenates, per slot: the base class, then one class per variant axis (the chosen or default value), then any matching compound classes. All have single-class specificity, so source order in the generated stylesheet — base first, variants next, compounds last — gives later layers the win on conflicts: what a call returns Button({ size: "sm", tone: "danger" }).root\n// "Button_root_0p4oom\n//  Button_size_sm_root_0p4oom\n//  Button_tone_danger_root_0p4oom" Responsive and `container` blocks can re-decide a variant per breakpoint or container width, and callers can pass { initial, md } objects for the same effect — see [Responsive](/docs/responsive) and [Container queries](/docs/container-queries) once your axes are in place.',
};

export function VariantsPage() {
  return (
    <DocArticle meta={variantsMeta}>
      <DocP>
        <fbt desc="Docs content — variants: opening">
          {
            "Variants are the props of a component. Each variant is an axis with named values; each value carries the styles that apply when a caller picks it:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Button {
  variants {
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      md { padding: space.2 space.4; font-size: font.md; }
      lg { padding: space.3 space.5; font-size: font.lg; }
    }
    tone {
      primary { background: color.primary; color: white; }
      danger  { background: color.danger; color: white; }
      ghost   { background: transparent; color: color.muted; }
    }
  }

  defaults {
    size: md;
    tone: primary;
  }
}`}
      />
      <DocCode
        label={"App.tsx"}
        code={`Button();                              // md + primary (defaults)
Button({ size: "lg" });                // lg + primary
Button({ size: "sm", tone: "ghost" }); // sm + ghost`}
      />
      <DocP>
        <fbt desc="Docs content — variants: orthogonal">
          {
            "Axes are orthogonal: every size works with every tone, and the compiler generates one class per value per slot it touches — three sizes and three tones produce six classes, not nine combinations. Styling specific combinations is what `compound` blocks are for."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: defaults required">{"Defaults and required props"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — variants: defaults semantics">
          {
            "The `defaults` block does double duty: it picks the runtime fallback when a prop is omitted, and it decides the TypeScript signature. A variant with a default is an optional prop; a variant without one is required:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Tag {
  variants {
    tone { info {} danger {} }     // no default — callers must choose
    size { sm {} md {} }
  }
  defaults { size: sm; }
}`}
      />
      <DocCode
        label={"generated .d.ts"}
        code={`export type TagProps = {
  tone: "info" | "danger";   // required
  size?: "sm" | "md";        // optional
};

export declare function Tag(props: TagProps): TagSlots;`}
      />
      <DocP>
        <fbt desc="Docs content — variants: required statement">
          {
            "Leaving a variant default-less is a design statement — “there is no neutral choice here” — and the type system enforces it at every call site. At runtime, an omitted default-less variant simply contributes no class."
          }
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — variants: checker support">
          {
            "The checker keeps defaults honest: referencing an unknown variant or value in defaults is an error with a fix (ARV124), an empty variant axis is flagged (ARV173), and duplicate axis or value names collide (ARV114)."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: full bodies">
          {"Variant values are full style bodies"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — variants: full bodies lead-in">
          {
            "A value block is not limited to declarations — it can style slots, attach states, and pull in recipes, all scoped to that value:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Button {
  slots { root {} icon {} }

  variants {
    tone {
      primary {
        background: color.primary;
        &:hover { filter: brightness(1.06); }   // hover, primary only
      }
      danger {
        use FocusRing;                           // recipe, danger only
        background: color.danger;
        icon { color: white; }                   // slot, danger only
        &:hover { icon { transform: scale(1.1); } } // cross-slot state
      }
    }
  }

  defaults { tone: primary; }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: boolean props">{"Modeling boolean props"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — variants: boolean modeling">
          {
            "Arvia has no boolean variant type — model on/off as a two-value axis. The names read better than true/false in both the `.arv` source and the call site, and they leave room for a third state later:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Field {
  variants {
    state {
      idle {}
      invalid {
        border-color: color.danger;
        &:focus-visible { outline-color: color.danger; }
      }
    }
  }
  defaults { state: idle; }
}

// Field({ state: invalid ? "invalid" : "idle" })`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: stacking">{"How variant classes stack"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — variants: stacking semantics">
          {
            "The generated function concatenates, per slot: the base class, then one class per variant axis (the chosen or default value), then any matching compound classes. All have single-class specificity, so source order in the generated stylesheet — base first, variants next, compounds last — gives later layers the win on conflicts:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"what a call returns"}
        lang={"js"}
        code={`Button({ size: "sm", tone: "danger" }).root
// "Button_root_0p4oom
//  Button_size_sm_root_0p4oom
//  Button_tone_danger_root_0p4oom"`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — variants: responsive pointer">
          {
            "Responsive and `container` blocks can re-decide a variant per breakpoint or container width, and callers can pass { initial, md } objects for the same effect — see [Responsive](/docs/responsive) and [Container queries](/docs/container-queries) once your axes are in place."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
