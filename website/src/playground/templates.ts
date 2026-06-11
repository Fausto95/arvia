import { fbt } from "fbtee";
import demoBadgeSource from "./components/demo-badge.arv?raw";
import demoButtonSource from "./components/demo-button.arv?raw";
import demoCardSource from "./components/demo-card.arv?raw";
import demoPulseSource from "./components/demo-pulse.arv?raw";
import demoStackSource from "./components/demo-stack.arv?raw";
import demoTextSource from "./components/demo-text.arv?raw";
import { getEditorTemplates } from "./editor/templates";
import { getRecipes } from "./recipes/index";
import type { PlaygroundTemplateGroup } from "../components/Playground";

/** Every demo on the site, loadable into the playground editor. */
export function getTemplateGroups(): PlaygroundTemplateGroup[] {
  return [
    {
      label: fbt("Starters", "Playground template group label"),
      items: getEditorTemplates().map((t) => ({
        id: `starter-${t.id}`,
        label: t.label,
        source: t.source,
      })),
    },
    {
      label: fbt("Demo components", "Playground template group label"),
      items: [
        {
          id: "demo-button",
          label: fbt("Button", "Playground demo component label"),
          source: demoButtonSource,
        },
        {
          id: "demo-badge",
          label: fbt("Badge", "Playground demo component label"),
          source: demoBadgeSource,
        },
        {
          id: "demo-card",
          label: fbt("Card", "Playground demo component label"),
          source: demoCardSource,
        },
        {
          id: "demo-text",
          label: fbt("Text", "Playground demo component label"),
          source: demoTextSource,
        },
        {
          id: "demo-stack",
          label: fbt("Stack", "Playground demo component label"),
          source: demoStackSource,
        },
        {
          id: "demo-pulse",
          label: fbt("Pulse", "Playground demo component label"),
          source: demoPulseSource,
        },
      ],
    },
    {
      label: fbt("Recipes", "Playground template group label"),
      items: getRecipes().map((r) => ({
        id: `recipe-${r.id}`,
        label: r.title,
        source: r.source,
      })),
    },
  ];
}
