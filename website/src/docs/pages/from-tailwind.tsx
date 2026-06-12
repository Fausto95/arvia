import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const from_tailwindMeta: DocPageMeta = {
  slug: "from-tailwind",
  title: <fbt desc="Docs page title — Coming from Tailwind">{"Coming from Tailwind"}</fbt>,
  description: (
    <fbt desc="Docs page description — Migrating from Tailwind.">
      {"Map utility-first habits onto tokens, variants, and compiled components."}
    </fbt>
  ),
  nav: { section: "migrate", order: 23 },
  searchText:
    'Tailwind and Arvia agree on the big things — design tokens enforced at build time, zero runtime styling — and disagree on where composition lives. Tailwind composes utilities in markup; Arvia compiles a component definition and hands your markup finished class names. Your Tailwind instincts map almost one-to-one: Tailwind concept Arvia equivalent theme scale in tailwind.config `theme { }` block — tokens like `space.4`, `color.primary` utility classes in className declarations inside a `component` or `style` @apply `recipe` + `use` — composition without emitting classes md:flex-row `responsive { md { layout: row; } }` or `{ initial, md }` props dark:bg-zinc-900 `modes: light | dark;` + `@dark { }` token overrides hover:opacity-90, focus-visible:ring `&:hover { }`, `&:focus-visible { }` states group-hover:translate-x-1 cross-slot states: `&:hover { icon { … } }` — no group class needed @container / cq utilities `container { wide { … } }` blocks with `$wide` props cva / tailwind-variants built in: `variants`, `defaults`, `compound` — fully typed The same button, twice Tailwind (with cva) const button = cva(\n  "inline-flex items-center gap-2 rounded-lg font-medium transition hover:brightness-105",\n  {\n    variants: {\n      size: { sm: "px-3 py-1 text-sm", lg: "px-5 py-3 text-base" },\n      tone: { primary: "bg-indigo-600 text-white", danger: "bg-red-600 text-white" },\n    },\n    compoundVariants: [{ size: "sm", tone: "danger", class: "font-bold uppercase" }],\n    defaultVariants: { size: "sm", tone: "primary" },\n  },\n); button.arv component Button {\n  base {\n    display: inline-flex;\n    align-items: center;\n    gap: space.2;\n    border-radius: radius.md;\n    font-weight: 500;\n    transition: filter duration.fast;\n    &:hover { filter: brightness(1.05); }\n  }\n\n  variants {\n    size {\n      sm { padding: space.1 space.3; font-size: font.sm; }\n      lg { padding: space.3 space.5; font-size: font.md; }\n    }\n    tone {\n      primary { background: color.primary; color: white; }\n      danger  { background: color.danger; color: white; }\n    }\n  }\n\n  defaults { size: sm; tone: primary; }\n\n  compound {\n    size: sm;\n    tone: danger;\n    root { font-weight: 700; text-transform: uppercase; }\n  }\n} Same decision space, different home: the definition moved out of a JS helper into a compiled file, the strings became checked declarations, and the variant props are typed without `VariantProps` gymnastics. The call site is what cva gives you, minus the className assembly: `Button({ size: "lg" }).root`. What you stop doing Scanning long className strings to find which utility sets the padding — each property appears once, in a named place. Fighting class-merge order with twMerge — variants, compounds, and utilities have a defined cascade order (see [FAQ](/docs/faq)). Inventing group/peer classes for parent-state styling — cross-slot states compile the descendant selector for you. What to watch out for No arbitrary values in markup. `w-[137px]` becomes a declaration in the component — or a [local token](/docs/local-tokens) when the magic number deserves a name. Utilities still exist, as `style` declarations — but reach for them after components, not before. The Tailwind habit of composing five utilities per element usually wants to be one component with variants. Responsive overrides switch whole variant values, not single properties. Group what changes at a breakpoint into a variant (`layout: stacked | row`) instead of overriding properties one by one.',
};

export function FromTailwindPage() {
  return (
    <DocArticle meta={from_tailwindMeta}>
      <DocP>
        <fbt desc="Docs content — tw: opening">
          {
            "Tailwind and Arvia agree on the big things — design tokens enforced at build time, zero runtime styling — and disagree on where composition lives. Tailwind composes utilities in markup; Arvia compiles a component definition and hands your markup finished class names. Your Tailwind instincts map almost one-to-one:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — tailwind concept">{"Tailwind concept"}</fbt>,
          <fbt desc="Docs table header — arvia equivalent">{"Arvia equivalent"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — tw config">{"theme scale in tailwind.config"}</fbt>,
            <fbt desc="Docs table cell — tw config arvia">
              {"`theme { }` block — tokens like `space.4`, `color.primary`"}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — tw utilities">{"utility classes in className"}</fbt>,
            <fbt desc="Docs table cell — tw utilities arvia">
              {"declarations inside a `component` or `style`"}
            </fbt>,
          ],
          [
            "@apply",
            <fbt desc="Docs table cell — tw apply arvia">
              {"`recipe` + `use` — composition without emitting classes"}
            </fbt>,
          ],
          [
            "md:flex-row",
            <fbt desc="Docs table cell — tw responsive arvia">
              {"`responsive { md { layout: row; } }` or `{ initial, md }` props"}
            </fbt>,
          ],
          [
            "dark:bg-zinc-900",
            <fbt desc="Docs table cell — tw dark arvia">
              {"`modes: light | dark;` + `@dark { }` token overrides"}
            </fbt>,
          ],
          [
            "hover:opacity-90, focus-visible:ring",
            <fbt desc="Docs table cell — tw states arvia">
              {"`&:hover { }`, `&:focus-visible { }` states"}
            </fbt>,
          ],
          [
            "group-hover:translate-x-1",
            <fbt desc="Docs table cell — tw group arvia">
              {"cross-slot states: `&:hover { icon { … } }` — no group class needed"}
            </fbt>,
          ],
          [
            "@container / cq utilities",
            <fbt desc="Docs table cell — tw container arvia">
              {"`container { wide { … } }` blocks with `$wide` props"}
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — tw cva">{"cva / tailwind-variants"}</fbt>,
            <fbt desc="Docs table cell — tw cva arvia">
              {"built in: `variants`, `defaults`, `compound` — fully typed"}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: tw button">{"The same button, twice"}</fbt>
      </DocH2>
      <DocCode
        label={"Tailwind (with cva)"}
        code={`const button = cva(
  "inline-flex items-center gap-2 rounded-lg font-medium transition hover:brightness-105",
  {
    variants: {
      size: { sm: "px-3 py-1 text-sm", lg: "px-5 py-3 text-base" },
      tone: { primary: "bg-indigo-600 text-white", danger: "bg-red-600 text-white" },
    },
    compoundVariants: [{ size: "sm", tone: "danger", class: "font-bold uppercase" }],
    defaultVariants: { size: "sm", tone: "primary" },
  },
);`}
      />
      <DocCode
        label={"button.arv"}
        code={`component Button {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    border-radius: radius.md;
    font-weight: 500;
    transition: filter duration.fast;
    &:hover { filter: brightness(1.05); }
  }

  variants {
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      lg { padding: space.3 space.5; font-size: font.md; }
    }
    tone {
      primary { background: color.primary; color: white; }
      danger  { background: color.danger; color: white; }
    }
  }

  defaults { size: sm; tone: primary; }

  compound {
    size: sm;
    tone: danger;
    root { font-weight: 700; text-transform: uppercase; }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — tw: button comparison">
          {
            'Same decision space, different home: the definition moved out of a JS helper into a compiled file, the strings became checked declarations, and the variant props are typed without `VariantProps` gymnastics. The call site is what cva gives you, minus the className assembly: `Button({ size: "lg" }).root`.'
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: tw stop doing">{"What you stop doing"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — tw stop scanning">
            {
              "Scanning long className strings to find which utility sets the padding — each property appears once, in a named place."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — tw stop merge">
            {
              "Fighting class-merge order with twMerge — variants, compounds, and utilities have a defined cascade order (see [FAQ](/docs/faq))."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — tw stop group">
            {
              "Inventing group/peer classes for parent-state styling — cross-slot states compile the descendant selector for you."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: tw gotchas">{"What to watch out for"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — tw gotcha arbitrary">
            {
              "No arbitrary values in markup. `w-[137px]` becomes a declaration in the component — or a [local token](/docs/local-tokens) when the magic number deserves a name."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — tw gotcha utilities">
            {
              "Utilities still exist, as `style` declarations — but reach for them after components, not before. The Tailwind habit of composing five utilities per element usually wants to be one component with variants."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — tw gotcha responsive">
            {
              "Responsive overrides switch whole variant values, not single properties. Group what changes at a breakpoint into a variant (`layout: stacked | row`) instead of overriding properties one by one."
            }
          </fbt>
        </DocLi>
      </DocUl>
    </DocArticle>
  );
}
