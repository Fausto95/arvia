import type { ReactNode } from "react";
import { Stack } from "./components/stack.arv";
import { Text } from "./components/text.arv";
import { RecipeCompoundButton } from "./recipes/compound.arv";
import { RecipeContainerCard } from "./recipes/container.arv";
import { RecipeFocusButton } from "./recipes/recipe-nested.arv";
import { RecipeImplicitBadge } from "./recipes/implicit-root.arv";
import { RecipePulseBox } from "./recipes/keyframes.arv";
import { RecipeTruncate } from "./recipes/style-decl.arv";
import { RecipeLocalTokenChip } from "./recipes/local-tokens.arv";
import { RecipeResponsiveButton } from "./recipes/responsive.arv";
import { RecipeSlotsButton } from "./recipes/slots.arv";
import { RecipeStatesButton } from "./recipes/states.arv";
import { RecipeSurfaceCard } from "./recipes/use-recipe.arv";
import { RecipeTokenBox } from "./recipes/tokens.arv";
import { RecipeVariantsButton } from "./recipes/variants.arv";

function RecipeSection(props: { file: string; title: string; children: ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid var(--arvia-color-border)",
        borderRadius: 12,
        padding: 20,
        background: "var(--arvia-color-surface)",
      }}
    >
      <p
        className={Text({ size: "sm", tone: "muted" }).root}
        style={{ fontFamily: "ui-monospace, monospace" }}
      >
        src/recipes/{props.file}
      </p>
      <h3 className={Text({ size: "lg", weight: "bold" }).root}>{props.title}</h3>
      <div style={{ marginTop: 16 }}>{props.children}</div>
    </section>
  );
}

export function Recipes() {
  const stack = Stack({ gap: "5" });
  const row = Stack({ direction: "row", gap: "3", align: "center", wrap: "yes" });

  return (
    <div className={stack.root}>
      <RecipeSection file="tokens.arv" title="Theme tokens">
        <span className={RecipeTokenBox().root}>color.primary · space.4</span>
      </RecipeSection>

      <RecipeSection file="implicit-root.arv" title="Implicit root slot">
        <div className={row.root}>
          <span className={RecipeImplicitBadge().root}>neutral</span>
          <span className={RecipeImplicitBadge({ tone: "success" }).root}>success</span>
        </div>
      </RecipeSection>

      <RecipeSection file="slots.arv" title="Slots">
        {(() => {
          const s = RecipeSlotsButton();
          return (
            <button type="button" className={s.root}>
              <span className={s.icon}>★</span>
              <span className={s.label}>Save</span>
            </button>
          );
        })()}
      </RecipeSection>

      <RecipeSection file="variants.arv" title="Variants & defaults">
        <div className={row.root}>
          <button type="button" className={RecipeVariantsButton().root}>
            default
          </button>
          <button
            type="button"
            className={RecipeVariantsButton({ size: "lg", tone: "danger" }).root}
          >
            lg danger
          </button>
        </div>
      </RecipeSection>

      <RecipeSection file="compound.arv" title="Compound variants">
        <div className={row.root}>
          <button
            type="button"
            className={RecipeCompoundButton({ size: "lg", tone: "danger" }).root}
          >
            lg danger
          </button>
          <button
            type="button"
            className={RecipeCompoundButton({ size: "sm", tone: "danger" }).root}
          >
            sm danger
          </button>
        </div>
      </RecipeSection>

      <RecipeSection file="states.arv" title="Pseudo states">
        <div className={row.root}>
          <button type="button" className={RecipeStatesButton().root}>
            hover me
          </button>
          <button type="button" className={RecipeStatesButton().root} disabled>
            disabled
          </button>
        </div>
      </RecipeSection>

      <RecipeSection file="use-recipe.arv" title="use recipe">
        <div className={RecipeSurfaceCard().root}>uses Surface from theme.arv</div>
      </RecipeSection>

      <RecipeSection file="recipe-nested.arv" title="Nested recipes">
        <button type="button" className={RecipeFocusButton().root}>
          tab to focus
        </button>
      </RecipeSection>

      <RecipeSection file="keyframes.arv" title="Keyframes">
        <div className={RecipePulseBox().root}>pulsing</div>
      </RecipeSection>

      <RecipeSection file="style-decl.arv" title="Styles (exported class)">
        <p className={RecipeTruncate}>
          A standalone style — one exported class string, no component ceremony.
        </p>
      </RecipeSection>

      <RecipeSection file="local-tokens.arv" title="Local tokens">
        <span className={RecipeLocalTokenChip().root}>space.pad = 6px (local)</span>
      </RecipeSection>

      <RecipeSection file="responsive.arv" title="Responsive">
        <p className={Text({ size: "sm", tone: "muted" }).root}>
          Resize the viewport — bumps to <code>lg</code> at 768px.
        </p>
        <button type="button" className={RecipeResponsiveButton().root}>
          responsive
        </button>
      </RecipeSection>

      <RecipeSection file="container.arv" title="Container queries">
        <p className={Text({ size: "sm", tone: "muted" }).root}>
          Drag the handle — switches to row past the <code>wide</code> container token.
        </p>
        {(() => {
          const card = RecipeContainerCard({
            layout: { initial: "stacked", $wide: "row" } as const,
          });
          return (
            <div
              className={card.root}
              style={{ resize: "horizontal", overflow: "auto", width: 320, minWidth: 180 }}
            >
              <span className={Text({ size: "sm" }).root}>Item A</span>
              <span className={Text({ size: "sm", tone: "muted" }).root}>Item B</span>
            </div>
          );
        })()}
      </RecipeSection>
    </div>
  );
}
