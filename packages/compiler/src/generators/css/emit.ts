import type { DeclIR, FileIR, StyleIR } from "../../ir/ir.js";
import { cssVarName } from "../../ir/ir.js";
import {
  baseClass,
  compoundClass,
  containerVariantClass,
  responsiveVariantClass,
  variantClass,
} from "../../ir/names.js";

/** Emits static, minification-ready CSS. */
export function emitCss(ir: FileIR): string {
  const out: string[] = [];

  const rule = (selector: string, decls: DeclIR[]) => {
    if (decls.length === 0) return;
    const body = decls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
    out.push(`${selector} {\n${body}\n}`);
  };

  const styleRules = (
    className: string,
    style: StyleIR,
    component?: FileIR["components"][number],
  ) => {
    rule(`.${className}`, style.decls);
    for (const state of style.states) {
      rule(state.selectors.map((s) => `.${className}${s}`).join(",\n"), state.decls);
      // Cross-slot states ("group hover"): the owner carries the state, the
      // target element is matched by its always-present base slot class.
      if (state.slotDecls && component) {
        for (const [slot, decls] of Object.entries(state.slotDecls)) {
          rule(
            state.selectors
              .map((s) => `.${className}${s} .${baseClass(component, slot)}`)
              .join(",\n"),
            decls,
          );
        }
      }
    }
  };

  const emitConditionalRules = (
    entries: { key: string; variants: Record<string, string> }[],
    sizes: Record<string, string>,
    classFn: (
      c: FileIR["components"][number],
      variant: string,
      value: string,
      key: string,
      slot: string,
    ) => string,
    wrap: (size: string, rules: string[]) => string,
    component: FileIR["components"][number],
  ) => {
    const grouped = new Map<string, string[]>();
    for (const entry of entries) {
      const size = sizes[entry.key];
      if (!size) continue;
      const rules: string[] = grouped.get(entry.key) ?? [];
      for (const [variantName, valueName] of Object.entries(entry.variants)) {
        const variant = component.variants.find((v) => v.name === variantName);
        const value = variant?.values.find((v) => v.name === valueName);
        if (!value) continue;
        for (const slot of component.slotNames) {
          const style = value.slots[slot];
          if (!style) continue;
          const className = classFn(component, variantName, valueName, entry.key, slot);
          const chunk: string[] = [];
          const emit = (selector: string, decls: DeclIR[]) => {
            if (decls.length === 0) return;
            const body = decls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
            chunk.push(`${selector} {\n${body}\n}`);
          };
          emit(`.${className}`, style.decls);
          for (const state of style.states) {
            emit(state.selectors.map((s) => `.${className}${s}`).join(",\n"), state.decls);
            if (state.slotDecls) {
              for (const [target, decls] of Object.entries(state.slotDecls)) {
                emit(
                  state.selectors
                    .map((s) => `.${className}${s} .${baseClass(component, target)}`)
                    .join(",\n"),
                  decls,
                );
              }
            }
          }
          rules.push(...chunk);
        }
      }
      grouped.set(entry.key, rules);
    }
    for (const [key, rules] of grouped) {
      const size = sizes[key];
      if (rules.length > 0 && size) out.push(wrap(size, rules));
    }
  };

  if (ir.themeVars.length > 0 && ir.themeModes) {
    const defaultMode = ir.themeModes[0]!;
    const altModes = ir.themeModes.slice(1);

    const fullDecls = (mode: string): DeclIR[] =>
      ir.themeVars.map((v) => ({
        property: cssVarName(v.group, v.name),
        value: v.byMode[mode]!,
      }));

    const overrideDecls = (mode: string): DeclIR[] => {
      const decls: DeclIR[] = [];
      for (const v of ir.themeVars) {
        const value = v.byMode[mode];
        if (value !== undefined && value !== v.byMode[defaultMode]) {
          decls.push({ property: cssVarName(v.group, v.name), value });
        }
      }
      return decls;
    };

    rule(":root", fullDecls(defaultMode));

    const mediaDarkDecls = altModes.length > 0 ? overrideDecls(altModes[0]!) : [];
    if (mediaDarkDecls.length > 0) {
      const body = mediaDarkDecls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
      out.push(`@media (prefers-color-scheme: dark) {\n  :root {\n${body}\n  }\n}`);
    }

    rule(`[data-arvia-theme="${defaultMode}"]`, fullDecls(defaultMode));
    for (const mode of altModes) {
      const decls = overrideDecls(mode);
      if (decls.length > 0) rule(`[data-arvia-theme="${mode}"]`, decls);
    }
  }

  for (const kf of ir.keyframes) {
    const steps = kf.steps
      .map((step) => {
        const body = step.decls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
        return `${step.selector} {\n${body}\n}`;
      })
      .join("\n\n");
    out.push(`@keyframes ${kf.cssName} {\n${steps}\n}`);
  }

  for (const global of ir.globals) {
    rule(global.selector, global.decls);
  }

  for (const c of ir.components) {
    if (c.containers.length > 0) {
      const root = baseClass(c, "root");
      rule(`.${root}`, [{ property: "container-type", value: "inline-size" }]);
    }

    for (const slot of c.slotNames) {
      styleRules(baseClass(c, slot), c.base[slot]!, c);
    }
    for (const variant of c.variants) {
      for (const value of variant.values) {
        for (const slot of c.slotNames) {
          const style = value.slots[slot];
          if (style) styleRules(variantClass(c, variant.name, value.name, slot), style, c);
        }
      }
    }

    emitConditionalRules(
      c.responsive.map((r) => ({ key: r.breakpoint, variants: r.variants })),
      ir.breakpoints,
      responsiveVariantClass,
      (size, rules) => `@media (min-width: ${size}) {\n${rules.join("\n\n")}\n}`,
      c,
    );

    emitConditionalRules(
      c.containers.map((r) => ({ key: r.container, variants: r.variants })),
      ir.containerSizes,
      containerVariantClass,
      (size, rules) => `@container (min-width: ${size}) {\n${rules.join("\n\n")}\n}`,
      c,
    );

    for (const compound of c.compounds) {
      for (const slot of c.slotNames) {
        const style = compound.slots[slot];
        if (style) styleRules(compoundClass(c, compound.match, slot), style, c);
      }
    }
  }

  // Standalone styles last (utilities-last): composed styles win the cascade.
  for (const s of ir.styles) {
    styleRules(s.className, s.style);
  }

  return out.length > 0 ? out.join("\n\n") + "\n" : "";
}
