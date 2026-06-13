import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const storybookMeta: DocPageMeta = {
  slug: "storybook",
  title: <fbt desc="Docs page title — Storybook">{"Storybook"}</fbt>,
  description: (
    <fbt desc="Docs page description — Auto-generate stories from component variants.">
      {"Generate CSF stories from your components' variants — for free."}
    </fbt>
  ),
  nav: { section: "tooling", order: 4 },
  searchText:
    "A component's variants, values, defaults, and slots are exactly the information a good story needs — so the generator derives stories from them instead of you writing both: terminal npm install -D @arviahq/storybook\narvia gen --storybook --theme src/theme.arv --out stories src/ For each component the generator emits a CSF file with: controls for every variant axis (typed as its value union), defaults pre-selected, a story per variant value so the matrix is browsable at a glance, and markup that wires every slot so multi-element components render meaningfully. Workflow Generated stories are a starting grid, not a cage. Two common setups: Fully generated — .gitignore the output directory and regenerate in CI; stories track components automatically and never drift. Generate once, then own — commit the output and edit freely (real content, interaction tests); regenerate selectively when a component's API changes. Stories import your `.arv` files, so the Storybook build needs the Arvia Vite plugin too — add arvia() to the Vite config Storybook uses, with the same theme path as your app. To see a complete setup, run `pnpm demo:storybook` in the Arvia monorepo — it generates stories for the demo components and boots Storybook on them. For a full atomic design system showcase with Language/* feature demos, run `pnpm design-system:storybook` (examples/design-system).",
};

export function StorybookPage() {
  return (
    <DocArticle meta={storybookMeta}>
      <DocP>
        <fbt desc="Docs content — storybook: opening">
          {
            "A component's variants, values, defaults, and slots are exactly the information a good story needs — so the generator derives stories from them instead of you writing both:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"terminal"}
        code={`npm install -D @arviahq/storybook
arvia gen --storybook --theme src/theme.arv --out stories src/`}
      />
      <DocP>
        <fbt desc="Docs content — storybook: what is generated">
          {
            "For each component the generator emits a CSF file with: controls for every variant axis (typed as its value union), defaults pre-selected, a story per variant value so the matrix is browsable at a glance, and markup that wires every slot so multi-element components render meaningfully."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: storybook workflow">{"Workflow"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — storybook: workflow lead-in">
          {"Generated stories are a starting grid, not a cage. Two common setups:"}
        </fbt>
      </DocP>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — storybook generated mode">
            {
              "Fully generated — .gitignore the output directory and regenerate in CI; stories track components automatically and never drift."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — storybook owned mode">
            {
              "Generate once, then own — commit the output and edit freely (real content, interaction tests); regenerate selectively when a component's API changes."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocCallout tone="info">
        <fbt desc="Docs note — storybook: vite config">
          {
            "Stories import your `.arv` files, so the Storybook build needs the Arvia Vite plugin too — add arvia() to the Vite config Storybook uses, with the same theme path as your app."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — storybook: demo pointer">
          {
            "To see a complete setup, run `pnpm demo:storybook` in the Arvia monorepo — it generates stories for the demo components and boots Storybook on them. For a full atomic design system showcase with Language/* feature demos, run `pnpm design-system:storybook` (examples/design-system)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
