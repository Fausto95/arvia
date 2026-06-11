import { fbt } from "fbtee";
import compoundSource from "./compound.arv?raw";
import containerSource from "./container.arv?raw";
import implicitRootSource from "./implicit-root.arv?raw";
import keyframesSource from "./keyframes.arv?raw";
import localTokensSource from "./local-tokens.arv?raw";
import recipeNestedSource from "./recipe-nested.arv?raw";
import responsiveSource from "./responsive.arv?raw";
import slotsSource from "./slots.arv?raw";
import statesSource from "./states.arv?raw";
import styleDeclSource from "./style-decl.arv?raw";
import tokensSource from "./tokens.arv?raw";
import useRecipeSource from "./use-recipe.arv?raw";
import variantsSource from "./variants.arv?raw";

export type RecipeEntry = {
  id: string;
  file: string;
  title: string;
  source: string;
};

export function getRecipes(): RecipeEntry[] {
  return [
    {
      id: "tokens",
      file: "tokens.arv",
      title: fbt("Theme tokens", "Playground recipe title"),
      source: tokensSource,
    },
    {
      id: "implicit-root",
      file: "implicit-root.arv",
      title: fbt("Implicit root slot", "Playground recipe title"),
      source: implicitRootSource,
    },
    {
      id: "slots",
      file: "slots.arv",
      title: fbt("Slots", "Playground recipe title"),
      source: slotsSource,
    },
    {
      id: "variants",
      file: "variants.arv",
      title: fbt("Variants & defaults", "Playground recipe title"),
      source: variantsSource,
    },
    {
      id: "compound",
      file: "compound.arv",
      title: fbt("Compound variants", "Playground recipe title"),
      source: compoundSource,
    },
    {
      id: "states",
      file: "states.arv",
      title: fbt("Pseudo states", "Playground recipe title"),
      source: statesSource,
    },
    {
      id: "use-recipe",
      file: "use-recipe.arv",
      title: fbt("use recipe", "Playground recipe title"),
      source: useRecipeSource,
    },
    {
      id: "recipe-nested",
      file: "recipe-nested.arv",
      title: fbt("Nested recipes", "Playground recipe title"),
      source: recipeNestedSource,
    },
    {
      id: "keyframes",
      file: "keyframes.arv",
      title: fbt("Keyframes", "Playground recipe title"),
      source: keyframesSource,
    },
    {
      id: "style-decl",
      file: "style-decl.arv",
      title: fbt("Styles (exported class)", "Playground recipe title"),
      source: styleDeclSource,
    },
    {
      id: "local-tokens",
      file: "local-tokens.arv",
      title: fbt("Local tokens", "Playground recipe title"),
      source: localTokensSource,
    },
    {
      id: "responsive",
      file: "responsive.arv",
      title: fbt("Responsive", "Playground recipe title"),
      source: responsiveSource,
    },
    {
      id: "container",
      file: "container.arv",
      title: fbt("Container queries", "Playground recipe title"),
      source: containerSource,
    },
  ];
}
