import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const componentsMeta: DocPageMeta = {
  slug: "components",
  title: <fbt desc="Docs page title — Components">{"Components"}</fbt>,
  description: (
    <fbt desc="Docs page description — Component anatomy and generated APIs.">
      {"The core construct: anatomy, the implicit root, and the generated API."}
    </fbt>
  ),
  nav: { section: "language", order: 10 },
  searchText:
    'A component is Arvia\'s main unit: a named bundle of styles that compiles to CSS classes plus a typed function for picking between them. Components scale from a one-liner to a multi-slot, multi-variant system — this page covers the anatomy; the linked pages go deep on each part. The simplest component badge.arv component Badge {\n  padding: space.1 space.3;\n  border-radius: radius.full;\n  font-size: font.sm;\n} App.tsx import { Badge } from "./badge.arv";\n\nconst styles = Badge();\n<span className={styles.root}>New</span> Declarations written directly at the component\'s top level style the implicit root slot — every component has one, even without any block structure. This shorthand is the idiomatic form for simple components; the compiler treats it exactly as if the declarations sat inside base { }. The full anatomy Everything that can appear inside a component, in one place. All items are optional and may appear in any order: component Button {\n  // Loose declarations — shorthand for base, style the root slot\n  cursor: pointer;\n\n  // Recipe inclusion at the root\n  use FocusRing;\n\n  base {                       // default styles for any slot + states\n    display: inline-flex;\n    gap: space.2;\n    padding: metrics.pad;\n    &:hover { filter: brightness(1.05); }\n    icon { flex-shrink: 0; }   // slot block inside base\n  }\n\n  slots {                      // declare named parts\n    root {}\n    icon {}\n    label { font-weight: 500; }\n  }\n\n  tokens {                     // component-scoped tokens\n    metrics { pad = 6px; }\n  }\n\n  variants {                   // prop-driven axes\n    size {\n      sm { font-size: font.sm; }\n      lg { font-size: font.md; }\n    }\n    tone {\n      primary { background: color.primary; }\n      danger  { background: color.danger; }\n    }\n  }\n\n  defaults { size: sm; tone: primary; }\n\n  compound {                   // extra styles for a combination\n    size: sm;\n    tone: danger;\n    root { font-weight: 700; }\n  }\n\n  responsive {                 // variant overrides per breakpoint\n    md { size: lg; }\n  }\n\n  container {                  // variant overrides per container width\n    wide { size: lg; }\n  }\n} Item Purpose Details base { … } Always-on styles for root, slots, and states. One per component (ARV115 on duplicates). slots { … } Declares the component\'s named parts. See [Slots](/docs/slots). tokens { … } Values visible only inside this component. See [Local tokens](/docs/local-tokens). variants / defaults The component\'s prop axes and their fallbacks. See [Variants & defaults](/docs/variants). compound { … } Styles gated on a combination of variant values. See [Compound variants](/docs/compound). responsive / container Variant switching at breakpoints / container widths. See [Responsive](/docs/responsive) and [Container queries](/docs/container-queries). use Recipe; Pulls a recipe\'s declarations into the root. See [Recipes & use](/docs/recipes). Component names must be valid JavaScript identifiers since they become exports — my-button is rejected (ARV116), and two components with one name in a file collide (ARV110). PascalCase is the convention. The generated API Each component compiles to a function taking a props object and returning one class string per slot, plus the matching TypeScript declarations: generated .d.ts export type ButtonProps = {\n  size?: "sm" | "lg";        // optional — has a default\n  tone?: "primary" | "danger";\n};\n\nexport type ButtonSlots = {\n  root: string;\n  icon: string;\n  label: string;\n};\n\nexport declare function Button(props?: ButtonProps): ButtonSlots; App.tsx const styles = Button({ size: "lg" });\n\nstyles.root;  // "Button_root_0p4oom Button_size_lg_root_0p4oom Button_tone_primary_root_0p4oom"\nstyles.icon;  // "Button_icon_0p4oom Button_size_lg_icon_0p4oom" The function is pure and dependency-free: object lookups and string concatenation, nothing else. Call it during render, memoize it, or hoist constant calls to module scope — the result for the same props is always the same strings. Class names you can read Generated class names follow a fixed scheme — `Component_variant_value_slot_hash` — so DevTools stays legible: `.Button_tone_danger_root_0p4oom` tells you the component, why the class applied, the element it styles, and which file it came from. The 6-character hash comes from the file path and component name, not the styles, so names survive edits (see [How compilation works](/docs/compilation)). Wrapping for your framework Arvia stops at class names on purpose — markup, refs, and accessibility stay yours. The typical React pattern is a thin wrapper that forwards everything else: Button.tsx import { Button as styles, type ButtonProps as StyleProps } from "./button.arv";\n\ntype Props = StyleProps & React.ComponentPropsWithoutRef<"button">;\n\nexport function Button({ size, tone, className, ...rest }: Props) {\n  const s = styles({ size, tone });\n  return <button {...rest} className={className ? `${s.root} ${className}` : s.root} />;\n}',
};

export function ComponentsPage() {
  return (
    <DocArticle meta={componentsMeta}>
      <DocP>
        <fbt desc="Docs content — components: opening">
          {
            "A component is Arvia's main unit: a named bundle of styles that compiles to CSS classes plus a typed function for picking between them. Components scale from a one-liner to a multi-slot, multi-variant system — this page covers the anatomy; the linked pages go deep on each part."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: simplest component">{"The simplest component"}</fbt>
      </DocH2>
      <DocCode
        label={"badge.arv"}
        code={`component Badge {
  padding: space.1 space.3;
  border-radius: radius.full;
  font-size: font.sm;
}`}
      />
      <DocCode
        label={"App.tsx"}
        code={`import { Badge } from "./badge.arv";

const styles = Badge();
<span className={styles.root}>New</span>`}
      />
      <DocP>
        <fbt desc="Docs content — components: implicit root">
          {
            "Declarations written directly at the component's top level style the implicit root slot — every component has one, even without any block structure. This shorthand is the idiomatic form for simple components; the compiler treats it exactly as if the declarations sat inside base { }."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: full anatomy">{"The full anatomy"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — components: anatomy lead-in">
          {
            "Everything that can appear inside a component, in one place. All items are optional and may appear in any order:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`component Button {
  // Loose declarations — shorthand for base, style the root slot
  cursor: pointer;

  // Recipe inclusion at the root
  use FocusRing;

  base {                       // default styles for any slot + states
    display: inline-flex;
    gap: space.2;
    padding: metrics.pad;
    &:hover { filter: brightness(1.05); }
    icon { flex-shrink: 0; }   // slot block inside base
  }

  slots {                      // declare named parts
    root {}
    icon {}
    label { font-weight: 500; }
  }

  tokens {                     // component-scoped tokens
    metrics { pad = 6px; }
  }

  variants {                   // prop-driven axes
    size {
      sm { font-size: font.sm; }
      lg { font-size: font.md; }
    }
    tone {
      primary { background: color.primary; }
      danger  { background: color.danger; }
    }
  }

  defaults { size: sm; tone: primary; }

  compound {                   // extra styles for a combination
    size: sm;
    tone: danger;
    root { font-weight: 700; }
  }

  responsive {                 // variant overrides per breakpoint
    md { size: lg; }
  }

  container {                  // variant overrides per container width
    wide { size: lg; }
  }
}`}
      />
      <DocTable
        headers={[
          <fbt desc="Docs table header — item">{"Item"}</fbt>,
          <fbt desc="Docs table header — purpose">{"Purpose"}</fbt>,
          <fbt desc="Docs table header — details">{"Details"}</fbt>,
        ]}
        rows={[
          [
            "base { … }",
            <fbt desc="Docs table cell — base purpose">
              {"Always-on styles for root, slots, and states."}
            </fbt>,
            <fbt desc="Docs table cell — base details">
              {"One per component (ARV115 on duplicates)."}
            </fbt>,
          ],
          [
            "slots { … }",
            <fbt desc="Docs table cell — slots purpose">
              {"Declares the component's named parts."}
            </fbt>,
            <fbt desc="Docs table cell — slots details">{"See [Slots](/docs/slots)."}</fbt>,
          ],
          [
            "tokens { … }",
            <fbt desc="Docs table cell — tokens purpose">
              {"Values visible only inside this component."}
            </fbt>,
            <fbt desc="Docs table cell — tokens details">
              {"See [Local tokens](/docs/local-tokens)."}
            </fbt>,
          ],
          [
            "variants / defaults",
            <fbt desc="Docs table cell — variants purpose">
              {"The component's prop axes and their fallbacks."}
            </fbt>,
            <fbt desc="Docs table cell — variants details">
              {"See [Variants & defaults](/docs/variants)."}
            </fbt>,
          ],
          [
            "compound { … }",
            <fbt desc="Docs table cell — compound purpose">
              {"Styles gated on a combination of variant values."}
            </fbt>,
            <fbt desc="Docs table cell — compound details">
              {"See [Compound variants](/docs/compound)."}
            </fbt>,
          ],
          [
            "responsive / container",
            <fbt desc="Docs table cell — responsive purpose">
              {"Variant switching at breakpoints / container widths."}
            </fbt>,
            <fbt desc="Docs table cell — responsive details">
              {
                "See [Responsive](/docs/responsive) and [Container queries](/docs/container-queries)."
              }
            </fbt>,
          ],
          [
            "use Recipe;",
            <fbt desc="Docs table cell — use purpose">
              {"Pulls a recipe's declarations into the root."}
            </fbt>,
            <fbt desc="Docs table cell — use details">{"See [Recipes & use](/docs/recipes)."}</fbt>,
          ],
        ]}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — components: naming">
          {
            "Component names must be valid JavaScript identifiers since they become exports — my-button is rejected (ARV116), and two components with one name in a file collide (ARV110). PascalCase is the convention."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: generated api">{"The generated API"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — components: api lead-in">
          {
            "Each component compiles to a function taking a props object and returning one class string per slot, plus the matching TypeScript declarations:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated .d.ts"}
        code={`export type ButtonProps = {
  size?: "sm" | "lg";        // optional — has a default
  tone?: "primary" | "danger";
};

export type ButtonSlots = {
  root: string;
  icon: string;
  label: string;
};

export declare function Button(props?: ButtonProps): ButtonSlots;`}
      />
      <DocCode
        label={"App.tsx"}
        code={`const styles = Button({ size: "lg" });

styles.root;  // "Button_root_0p4oom Button_size_lg_root_0p4oom Button_tone_primary_root_0p4oom"
styles.icon;  // "Button_icon_0p4oom Button_size_lg_icon_0p4oom"`}
      />
      <DocP>
        <fbt desc="Docs content — components: pure function">
          {
            "The function is pure and dependency-free: object lookups and string concatenation, nothing else. Call it during render, memoize it, or hoist constant calls to module scope — the result for the same props is always the same strings."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: class names">{"Class names you can read"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — components: class scheme">
          {
            "Generated class names follow a fixed scheme — `Component_variant_value_slot_hash` — so DevTools stays legible: `.Button_tone_danger_root_0p4oom` tells you the component, why the class applied, the element it styles, and which file it came from. The 6-character hash comes from the file path and component name, not the styles, so names survive edits (see [How compilation works](/docs/compilation))."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: wrapping">{"Wrapping for your framework"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — components: wrapper lead-in">
          {
            "Arvia stops at class names on purpose — markup, refs, and accessibility stay yours. The typical React pattern is a thin wrapper that forwards everything else:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"Button.tsx"}
        code={`import { Button as styles, type ButtonProps as StyleProps } from "./button.arv";

type Props = StyleProps & React.ComponentPropsWithoutRef<"button">;

export function Button({ size, tone, className, ...rest }: Props) {
  const s = styles({ size, tone });
  return <button {...rest} className={className ? \`\${s.root} \${className}\` : s.root} />;
}`}
      />
    </DocArticle>
  );
}
