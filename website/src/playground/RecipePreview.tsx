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
import { DemoStack } from "./components/demo-stack.arv";
import { DemoText } from "./components/demo-text.arv";

export function RecipePreview(props: { id: string }) {
  const row = DemoStack({ direction: "row", gap: "3", align: "center", wrap: "yes" });

  switch (props.id) {
    case "tokens":
      return <span className={RecipeTokenBox().root}>color.primary · space.4</span>;

    case "implicit-root":
      return (
        <div className={row.root}>
          <span className={RecipeImplicitBadge().root}>neutral</span>
          <span className={RecipeImplicitBadge({ tone: "success" }).root}>success</span>
        </div>
      );

    case "slots": {
      const s = RecipeSlotsButton();
      return (
        <button type="button" className={s.root}>
          <span className={s.icon}>★</span>
          <span className={s.label}>Save</span>
        </button>
      );
    }

    case "variants":
      return (
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
      );

    case "compound":
      return (
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
      );

    case "states":
      return (
        <div className={row.root}>
          <button type="button" className={RecipeStatesButton().root}>
            hover me
          </button>
          <button type="button" className={RecipeStatesButton().root} disabled>
            disabled
          </button>
        </div>
      );

    case "use-recipe":
      return <div className={RecipeSurfaceCard().root}>uses Surface from theme.arv</div>;

    case "recipe-nested":
      return (
        <button type="button" className={RecipeFocusButton().root}>
          tab to focus
        </button>
      );

    case "keyframes":
      return <div className={RecipePulseBox().root}>pulsing</div>;

    case "style-decl":
      return (
        <p className={RecipeTruncate}>
          A standalone style — one exported class string, no component ceremony.
        </p>
      );

    case "local-tokens":
      return (
        <span className={RecipeLocalTokenChip().root}>space.pad = 6px (local)</span>
      );

    case "responsive":
      return (
        <div className={DemoStack({ gap: "2" }).root}>
          <p className={DemoText({ size: "sm", tone: "muted" }).root}>
            Resize the viewport — bumps to <code>lg</code> at 768px.
          </p>
          <button type="button" className={RecipeResponsiveButton().root}>
            responsive
          </button>
        </div>
      );

    case "container": {
      const card = RecipeContainerCard({
        layout: { initial: "stacked", $wide: "row" } as const,
      });
      return (
        <div className={DemoStack({ gap: "2" }).root}>
          <p className={DemoText({ size: "sm", tone: "muted" }).root}>
            Drag the handle — switches to row past the <code>wide</code> container token.
          </p>
          <div
            className={card.root}
            style={{ resize: "horizontal", overflow: "auto", width: 320, minWidth: 180 }}
          >
            <span className={DemoText({ size: "sm" }).root}>Item A</span>
            <span className={DemoText({ size: "sm", tone: "muted" }).root}>Item B</span>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
