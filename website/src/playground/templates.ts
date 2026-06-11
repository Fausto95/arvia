import demoBadgeSource from "./components/demo-badge.arv?raw";
import demoButtonSource from "./components/demo-button.arv?raw";
import demoCardSource from "./components/demo-card.arv?raw";
import demoPulseSource from "./components/demo-pulse.arv?raw";
import demoStackSource from "./components/demo-stack.arv?raw";
import demoTextSource from "./components/demo-text.arv?raw";
import { EDITOR_TEMPLATES } from "./editor/templates";
import { RECIPES } from "./recipes/index";
import type { PlaygroundTemplateGroup } from "../components/Playground";

/** Every demo on the site, loadable into the playground editor. */
export const TEMPLATE_GROUPS: PlaygroundTemplateGroup[] = [
  {
    label: "Starters",
    items: EDITOR_TEMPLATES.map((t) => ({
      id: `starter-${t.id}`,
      label: t.label,
      source: t.source,
    })),
  },
  {
    label: "Demo components",
    items: [
      { id: "demo-button", label: "Button", source: demoButtonSource },
      { id: "demo-badge", label: "Badge", source: demoBadgeSource },
      { id: "demo-card", label: "Card", source: demoCardSource },
      { id: "demo-text", label: "Text", source: demoTextSource },
      { id: "demo-stack", label: "Stack", source: demoStackSource },
      { id: "demo-pulse", label: "Pulse", source: demoPulseSource },
    ],
  },
  {
    label: "Recipes",
    items: RECIPES.map((r) => ({
      id: `recipe-${r.id}`,
      label: r.title,
      source: r.source,
    })),
  },
];
