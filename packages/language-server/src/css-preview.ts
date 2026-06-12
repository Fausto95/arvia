import { buildIR, emitCss, type ComponentIR, type FileIR, type StyleIR } from "@arviahq/compiler";
import type { AstTarget } from "./ast-query.js";
import type { DocumentAnalysis } from "./documents.js";

const MAX_LINES = 24;

/**
 * The compiled CSS for the declaration under the cursor: whole component,
 * one slot, one variant (value), a standalone style or a keyframes block —
 * produced by narrowing the file IR to the target and re-emitting.
 */
export function cssPreviewFor(analysis: DocumentAnalysis, target: AstTarget): string | null {
  // buildIR's contract requires a clean check.
  if (analysis.diagnostics.some((d) => d.severity === "error")) return null;

  let ir: FileIR;
  try {
    ir = buildIR(analysis.ast, analysis.env, { filename: analysis.file });
  } catch {
    return null;
  }

  const empty: FileIR = {
    ...ir,
    globals: [],
    components: [],
    styles: [],
    themeVars: [],
    keyframes: [],
  };

  let scoped: FileIR | null = null;
  switch (target.kind) {
    case "component-name": {
      const component = componentOf(ir, target.component.name);
      if (component) scoped = { ...empty, components: [component] };
      break;
    }
    case "slot-name": {
      const component = componentOf(ir, target.component.name);
      if (component) scoped = { ...empty, components: [narrowToSlot(component, target.name)] };
      break;
    }
    case "variant-name":
    case "variant-value-name": {
      const component = componentOf(ir, target.component.name);
      if (!component) break;
      const variantName = target.variant.name;
      const valueName = target.kind === "variant-value-name" ? target.value.name : null;
      scoped = { ...empty, components: [narrowToVariant(component, variantName, valueName)] };
      break;
    }
    case "style-name": {
      const style = ir.styles.find((s) => s.name === target.style.name);
      if (style) scoped = { ...empty, styles: [style] };
      break;
    }
    case "keyframes-name": {
      const kf = ir.keyframes.find((k) => k.name === target.keyframes.name);
      if (kf) scoped = { ...empty, keyframes: [kf] };
      break;
    }
    default:
      return null;
  }
  if (!scoped) return null;

  const css = emitCss(scoped);
  if (!css) return null;
  return truncate(css);
}

const emptyStyle = (): StyleIR => ({ decls: [], states: [] });

function componentOf(ir: FileIR, name: string): ComponentIR | null {
  return ir.components.find((c) => c.name === name) ?? null;
}

function narrowToSlot(component: ComponentIR, slot: string): ComponentIR {
  return {
    ...component,
    slotNames: [slot],
    base: { [slot]: component.base[slot] ?? emptyStyle() },
    variants: component.variants.map((variant) => ({
      ...variant,
      values: variant.values.map((value) => ({
        ...value,
        slots: value.slots[slot] ? { [slot]: value.slots[slot] } : {},
      })),
    })),
    compounds: component.compounds.map((compound) => ({
      ...compound,
      slots: compound.slots[slot] ? { [slot]: compound.slots[slot] } : {},
    })),
    containers: [],
  };
}

function narrowToVariant(
  component: ComponentIR,
  variantName: string,
  valueName: string | null,
): ComponentIR {
  const variant = component.variants.find((v) => v.name === variantName);
  return {
    ...component,
    base: Object.fromEntries(component.slotNames.map((slot) => [slot, emptyStyle()])),
    variants: variant
      ? [
          valueName === null
            ? variant
            : { ...variant, values: variant.values.filter((v) => v.name === valueName) },
        ]
      : [],
    compounds: [],
    responsive: component.responsive
      .map((entry) => ({
        ...entry,
        variants: Object.fromEntries(
          Object.entries(entry.variants).filter(
            ([v, value]) => v === variantName && (valueName === null || value === valueName),
          ),
        ),
      }))
      .filter((entry) => Object.keys(entry.variants).length > 0),
    containers: [],
  };
}

function truncate(css: string): string {
  const lines = css.trimEnd().split("\n");
  if (lines.length <= MAX_LINES) return lines.join("\n") + "\n";
  return lines.slice(0, MAX_LINES).join("\n") + "\n/* … */\n";
}
