import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const variantsMeta: DocPageMeta = {
  slug: "variants",
  title: <fbt desc="Docs page title — Variants">{"Variants & defaults"}</fbt>,
  description: (
    <fbt desc="Docs page description — Prop-driven style axes.">
      {"Named style axes you switch from the call site, with typed props."}
    </fbt>
  ),
  nav: { section: "language", order: 8 },
  searchText:
    'A variant is a named axis of choices. Add a variants block, and a defaults block for the value used when the caller passes nothing. component Button { base { color: white; } variants { tone { primary { background: color.primary; } danger { background: color.danger; } } size { sm { font-size: font.sm; } lg { font-size: font.lg; } } } defaults { tone: primary; size: sm; } } The component function takes typed props: const a = Button(); const b = Button({ tone: "danger", size: "lg" }). Each value is a string union, so passing an unknown value is a TypeScript error. A variant without a default makes its prop required. Related: Defaults are part of variants; Compound variants for combinations; Responsive to switch by breakpoint.',
};

export function VariantsPage() {
  return (
    <DocArticle meta={variantsMeta}>
      <DocP>
        <fbt desc="Docs content — variants: what">
          {
            "A variant is a named axis of choices — like `tone` or `size`. Add a `variants` block, and a `defaults` block for the value used when the caller passes nothing:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  base { color: white; }

  variants {
    tone {
      primary { background: color.primary; }
      danger { background: color.danger; }
    }
    size {
      sm { font-size: font.sm; }
      lg { font-size: font.lg; }
    }
  }

  defaults { tone: primary; size: sm; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — variants: usage">
          {"The component function now takes typed props — each value is a string union:"}
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`const a = Button();                          // primary, sm
const b = Button({ tone: "danger", size: "lg" });`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — variants: required">
          {
            "Passing a value that doesn't exist is a TypeScript error. A variant with no entry in `defaults` makes its prop required at the call site."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — variants: related">
          {
            "[Compound variants](/docs/compound) for combinations · [Responsive](/docs/responsive) to switch a variant by breakpoint."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
