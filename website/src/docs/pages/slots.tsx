import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const slotsMeta: DocPageMeta = {
  slug: "slots",
  title: <fbt desc="Docs page title — Slots">{"Slots"}</fbt>,
  description: (
    <fbt desc="Docs page description — Named parts of a multi-element component.">
      {"Named parts of a multi-element component, each with its own class."}
    </fbt>
  ),
  nav: { section: "language", order: 11 },
  searchText:
    "Real components are rarely one element — a button has an icon and a label, a card has a header and a body. Slots give each part a name and its own generated class, while keeping every part's styling inside one component definition: button.arv component Button {\n  slots {\n    root {}\n    icon { flex-shrink: 0; }\n    label { font-weight: 500; }\n  }\n\n  base {\n    display: inline-flex;\n    align-items: center;\n    gap: space.2;\n  }\n} App.tsx const styles = Button();\n\n<button className={styles.root}>\n  <span className={styles.icon}>★</span>\n  <span className={styles.label}>Save</span>\n</button> The `slots` block declares the parts; declarations inside a slot are that part's base styles. The function returns one class string per declared slot, and the generated ButtonSlots type knows every name — styles.icno is a compile error in TypeScript, and icno inside the `.arv` file is an ARV120 error with a did-you-mean. root is implicit. Every component has it whether or not the `slots` block lists it; loose top-level declarations and bare declarations in base style it. Declaring root {} explicitly is purely stylistic. Styling slots from anywhere Slots are addressable from every styling context — base, variant values, `compound` blocks, and states. A nested block named after a slot targets that slot under the surrounding condition: component Button {\n  slots { root {} icon {} label {} }\n\n  base {\n    display: inline-flex;\n    gap: space.2;\n    icon { flex-shrink: 0; }          // always\n\n    &:hover {\n      icon { transform: translateX(2px); }  // when root is hovered\n    }\n  }\n\n  variants {\n    size {\n      sm {}\n      lg {\n        font-size: font.lg;\n        icon { width: 20px; }          // only at size: lg\n      }\n    }\n    tone {\n      default {}\n      danger { background: color.danger; }\n    }\n  }\n\n  compound {\n    size: lg;\n    tone: danger;\n    label { text-transform: uppercase; } // only for that combination\n  }\n} Each context compiles to its own class on the slot — Button_icon_…, Button_size_lg_icon_… — and the component function merges the right ones into styles.icon for the props you pass. You never assemble per-slot classes by hand. Group hover and cross-slot states The hover example above is the cross-slot pattern: a slot block inside an `&-state` styles that slot when the root matches. It compiles to a descendant selector against the slot's base class: generated CSS .Button_root_0p4oom:hover .Button_icon_0p4oom {\n  transform: translateX(2px);\n} Because the target is the slot's always-present base class, the rule works regardless of which variants are active. The same pattern from a variant body scopes the behavior to that variant — see [States](/docs/states) for the full picture. Slots and markup stay decoupled A slot is a class, not a DOM contract. You decide which element receives it, you can skip rendering a slot entirely (an icon-less button simply never uses styles.icon), and you can hand a slot class to a child component. Unused declared slots are deliberately not a warning for exactly this reason. Card with optional parts component Card {\n  slots {\n    root {}\n    title { font-size: font.lg; font-weight: 600; }\n    body { color: color.muted; }\n    footer { border-top: 1px solid color.border; padding-top: space.3; }\n  }\n\n  base {\n    use Surface;\n    padding: space.5;\n    display: flex;\n    flex-direction: column;\n    gap: space.3;\n  }\n} App.tsx const card = Card();\n\n<article className={card.root}>\n  <h3 className={card.title}>{title}</h3>\n  <div className={card.body}>{children}</div>\n  {footer && <footer className={card.footer}>{footer}</footer>}\n</article> Slot blocks cannot nest — icon { label { … } } is a parse error. Slots are a flat namespace per component; hierarchy lives in your markup, not the style definition.",
};

export function SlotsPage() {
  return (
    <DocArticle meta={slotsMeta}>
      <DocP>
        <fbt desc="Docs content — slots: opening">
          {
            "Real components are rarely one element — a button has an icon and a label, a card has a header and a body. Slots give each part a name and its own generated class, while keeping every part's styling inside one component definition:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  slots {
    root {}
    icon { flex-shrink: 0; }
    label { font-weight: 500; }
  }

  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
  }
}`}
      />
      <DocCode
        label={"App.tsx"}
        code={`const styles = Button();

<button className={styles.root}>
  <span className={styles.icon}>★</span>
  <span className={styles.label}>Save</span>
</button>`}
      />
      <DocP>
        <fbt desc="Docs content — slots: declaration semantics">
          {
            "The `slots` block declares the parts; declarations inside a slot are that part's base styles. The function returns one class string per declared slot, and the generated ButtonSlots type knows every name — styles.icno is a compile error in TypeScript, and icno inside the `.arv` file is an ARV120 error with a did-you-mean."
          }
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — slots: implicit root">
          {
            "root is implicit. Every component has it whether or not the `slots` block lists it; loose top-level declarations and bare declarations in base style it. Declaring root {} explicitly is purely stylistic."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: slots from anywhere">
          {"Styling slots from anywhere"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: anywhere lead-in">
          {
            "Slots are addressable from every styling context — base, variant values, `compound` blocks, and states. A nested block named after a slot targets that slot under the surrounding condition:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Button {
  slots { root {} icon {} label {} }

  base {
    display: inline-flex;
    gap: space.2;
    icon { flex-shrink: 0; }          // always

    &:hover {
      icon { transform: translateX(2px); }  // when root is hovered
    }
  }

  variants {
    size {
      sm {}
      lg {
        font-size: font.lg;
        icon { width: 20px; }          // only at size: lg
      }
    }
    tone {
      default {}
      danger { background: color.danger; }
    }
  }

  compound {
    size: lg;
    tone: danger;
    label { text-transform: uppercase; } // only for that combination
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — slots: per-context classes">
          {
            "Each context compiles to its own class on the slot — Button_icon_…, Button_size_lg_icon_… — and the component function merges the right ones into styles.icon for the props you pass. You never assemble per-slot classes by hand."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: group hover">{"Group hover and cross-slot states"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: cross-slot lead-in">
          {
            "The hover example above is the cross-slot pattern: a slot block inside an `&-state` styles that slot when the root matches. It compiles to a descendant selector against the slot's base class:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`.Button_root_0p4oom:hover .Button_icon_0p4oom {
  transform: translateX(2px);
}`}
      />
      <DocP>
        <fbt desc="Docs content — slots: cross-slot semantics">
          {
            "Because the target is the slot's always-present base class, the rule works regardless of which variants are active. The same pattern from a variant body scopes the behavior to that variant — see [States](/docs/states) for the full picture."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: decoupled">{"Slots and markup stay decoupled"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: decoupled">
          {
            "A slot is a class, not a DOM contract. You decide which element receives it, you can skip rendering a slot entirely (an icon-less button simply never uses styles.icon), and you can hand a slot class to a child component. Unused declared slots are deliberately not a warning for exactly this reason."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"Card with optional parts"}
        code={`component Card {
  slots {
    root {}
    title { font-size: font.lg; font-weight: 600; }
    body { color: color.muted; }
    footer { border-top: 1px solid color.border; padding-top: space.3; }
  }

  base {
    use Surface;
    padding: space.5;
    display: flex;
    flex-direction: column;
    gap: space.3;
  }
}`}
      />
      <DocCode
        label={"App.tsx"}
        code={`const card = Card();

<article className={card.root}>
  <h3 className={card.title}>{title}</h3>
  <div className={card.body}>{children}</div>
  {footer && <footer className={card.footer}>{footer}</footer>}
</article>`}
      />
      <DocCallout tone="warning">
        <fbt desc="Docs note — slots: no nesting">
          {
            "Slot blocks cannot nest — icon { label { … } } is a parse error. Slots are a flat namespace per component; hierarchy lives in your markup, not the style definition."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
