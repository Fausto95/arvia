import type { ReactNode } from "react";
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

export const RECIPES: RecipeEntry[] = [
  { id: "tokens", file: "tokens.arv", title: "Theme tokens", source: tokensSource },
  {
    id: "implicit-root",
    file: "implicit-root.arv",
    title: "Implicit root slot",
    source: implicitRootSource,
  },
  { id: "slots", file: "slots.arv", title: "Slots", source: slotsSource },
  { id: "variants", file: "variants.arv", title: "Variants & defaults", source: variantsSource },
  { id: "compound", file: "compound.arv", title: "Compound variants", source: compoundSource },
  { id: "states", file: "states.arv", title: "Pseudo states", source: statesSource },
  { id: "use-recipe", file: "use-recipe.arv", title: "use recipe", source: useRecipeSource },
  {
    id: "recipe-nested",
    file: "recipe-nested.arv",
    title: "Nested recipes",
    source: recipeNestedSource,
  },
  { id: "keyframes", file: "keyframes.arv", title: "Keyframes", source: keyframesSource },
  {
    id: "style-decl",
    file: "style-decl.arv",
    title: "Styles (exported class)",
    source: styleDeclSource,
  },
  {
    id: "local-tokens",
    file: "local-tokens.arv",
    title: "Local tokens",
    source: localTokensSource,
  },
  { id: "responsive", file: "responsive.arv", title: "Responsive", source: responsiveSource },
  {
    id: "container",
    file: "container.arv",
    title: "Container queries",
    source: containerSource,
  },
];

export type RecipePreviewProps = { id: string };
