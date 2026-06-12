import type { ArviaFile, RawValue, StyleBody, StyleItem } from "../ast/nodes.js";
import {
  emptyStyle,
  isEmptyStyle,
  type CompoundIR,
  type ContainerIR,
  type FileIR,
  type GlobalRuleIR,
  type KeyframesIR,
  type StyleDeclIR,
  type StyleIR,
  type ThemeEnv,
  type ResponsiveIR,
  type ThemeVarIR,
  type VariantIR,
} from "./ir.js";
import { hashName, relativeName } from "./hash.js";
import { substituteRefs, substituteRefsForMode, type LocalTokens } from "../values.js";

export interface BuildOptions {
  filename: string;
  root?: string;
}

/** Builds the file IR. Must only be called after `check` reported no errors. */
export function buildIR(ast: ArviaFile, env: ThemeEnv, options: BuildOptions): FileIR {
  const rel = relativeName(options.filename, options.root);

  // Component tokens shadow theme tokens while their component is being built.
  let localTokens: LocalTokens | null = null;
  const resolveValue = (value: RawValue): string =>
    substituteRefs(value, env, undefined, localTokens);

  const applyItems = (target: StyleIR, items: StyleItem[]) => {
    for (const item of items) {
      if (item.kind === "decl") {
        target.decls.push({ property: item.property, value: resolveValue(item.value) });
      } else if (item.kind === "use") {
        const recipe = env.recipes[item.recipe];
        if (recipe) {
          target.decls.push(...recipe.decls);
          target.states.push(...recipe.states);
        }
      } else {
        const state: StyleIR["states"][number] = {
          selectors: item.selectors,
          decls: item.items.map((d) => ({ property: d.property, value: resolveValue(d.value) })),
        };
        if (item.slots.length > 0) {
          const slotDecls: Record<string, { property: string; value: string }[]> = {};
          for (const slot of item.slots) {
            (slotDecls[slot.name] ??= []).push(
              ...slot.items.flatMap((d) =>
                d.kind === "decl" ? [{ property: d.property, value: resolveValue(d.value) }] : [],
              ),
            );
          }
          state.slotDecls = slotDecls;
        }
        target.states.push(state);
      }
    }
  };

  const applyBody = (body: StyleBody, ensure: (slot: string) => StyleIR) => {
    for (const item of body.items) {
      if (item.kind === "slotblock") {
        applyItems(ensure(item.name), item.items);
      } else {
        applyItems(ensure("root"), [item]);
      }
    }
  };

  const globals: GlobalRuleIR[] = [];
  const components: FileIR["components"] = [];
  const styles: StyleDeclIR[] = [];
  const themeVars: ThemeVarIR[] = [];
  const keyframes: KeyframesIR[] = [];
  let themeModes: string[] | null = null;

  for (const top of ast.items) {
    if (top.kind === "theme") {
      themeModes = env.modes;
      for (const group of top.groups) {
        if (group.name === "breakpoint" || group.name === "container") continue;
        const bucket = env.tokens[group.name];
        if (!bucket) continue;
        for (const entry of group.entries) {
          const rawByMode: Record<string, RawValue> = env.modes
            ? { [env.modes[0]!]: entry.value }
            : { default: entry.value };
          if (env.modes) {
            for (const override of group.overrides) {
              for (const o of override.entries) {
                if (o.name === entry.name) rawByMode[override.mode] = o.value;
              }
            }
          }
          const byMode: Record<string, string> = {};
          const modes = env.modes ?? ["default"];
          for (const mode of modes) {
            const raw = rawByMode[mode] ?? entry.value;
            byMode[mode] = env.modes
              ? substituteRefsForMode(raw, env.tokens, mode, env.modes)
              : substituteRefs(raw, env);
          }
          themeVars.push({
            group: group.name,
            name: entry.name,
            doc: env.tokenDocs[group.name]?.[entry.name] ?? entry.doc,
            byMode,
          });
        }
      }
      continue;
    }
    if (top.kind === "keyframes") {
      keyframes.push({
        name: top.name,
        nameSpan: top.nameSpan,
        cssName: env.keyframes[top.name]!,
        steps: top.steps.map((step) => ({
          selector: step.selector,
          decls: step.decls.map((d) => ({
            property: d.property,
            value: resolveValue(d.value),
          })),
        })),
      });
      continue;
    }
    if (top.kind === "global") {
      for (const rule of top.rules) {
        globals.push({
          selector: rule.selector,
          decls: rule.decls.map((d) => ({ property: d.property, value: resolveValue(d.value) })),
        });
      }
      continue;
    }
    if (top.kind === "styledecl") {
      const style = emptyStyle();
      applyItems(style, top.items);
      const hash = hashName(rel, top.name);
      styles.push({
        name: top.name,
        nameSpan: top.nameSpan,
        hash,
        className: `${top.name}_${hash}`,
        style,
      });
      continue;
    }
    if (top.kind !== "component") continue;

    const slotNames = ["root"];
    const componentTokens: LocalTokens = {};
    let hasComponentTokens = false;
    for (const item of top.items) {
      if (item.kind === "tokens") {
        for (const group of item.groups) {
          const bucket = (componentTokens[group.name] ??= {});
          for (const entry of group.entries) {
            if (bucket[entry.name] === undefined) {
              bucket[entry.name] = entry.value.text;
              hasComponentTokens = true;
            }
          }
        }
        continue;
      }
      if (item.kind !== "slots") continue;
      for (const slot of item.slots) {
        if (!slotNames.includes(slot.name)) slotNames.push(slot.name);
      }
    }
    localTokens = hasComponentTokens ? componentTokens : null;

    const base: Record<string, StyleIR> = {};
    for (const slot of slotNames) base[slot] = emptyStyle();
    const ensureBase = (slot: string) => (base[slot] ??= emptyStyle());

    const variants: VariantIR[] = [];
    const defaults: Record<string, string> = {};
    const responsive: ResponsiveIR[] = [];
    const containers: ContainerIR[] = [];
    const pendingCompounds: { matchers: [string, string][]; slots: Record<string, StyleIR> }[] = [];

    for (const item of top.items) {
      switch (item.kind) {
        case "decl":
        case "use":
          applyItems(ensureBase("root"), [item]);
          break;
        case "base":
          applyBody(item.body, ensureBase);
          break;
        case "slots":
          for (const slot of item.slots) applyItems(ensureBase(slot.name), slot.items);
          break;
        case "variants":
          for (const variant of item.variants) {
            variants.push({
              name: variant.name,
              values: variant.values.map((value) => {
                const slots: Record<string, StyleIR> = {};
                applyBody(value.body, (slot) => (slots[slot] ??= emptyStyle()));
                pruneEmpty(slots);
                return { name: value.name, slots };
              }),
            });
          }
          break;
        case "defaults":
          for (const entry of item.entries) defaults[entry.variant] = entry.value;
          break;
        case "responsive":
          for (const entry of item.entries) {
            responsive.push({
              breakpoint: entry.breakpoint,
              variants: Object.fromEntries(entry.variants.map((v) => [v.variant, v.value])),
            });
          }
          break;
        case "container":
          for (const entry of item.entries) {
            containers.push({
              container: entry.container,
              variants: Object.fromEntries(entry.variants.map((v) => [v.variant, v.value])),
            });
          }
          break;
        case "compound": {
          const slots: Record<string, StyleIR> = {};
          for (const slot of item.slots) {
            applyItems((slots[slot.name] ??= emptyStyle()), slot.items);
          }
          pruneEmpty(slots);
          pendingCompounds.push({
            matchers: item.matchers.map((m) => [m.variant, m.value]),
            slots,
          });
          break;
        }
      }
    }

    const variantOrder = new Map(variants.map((v, i) => [v.name, i]));
    const compounds: CompoundIR[] = pendingCompounds.map((c) => ({
      match: c.matchers.toSorted(
        (a, b) => (variantOrder.get(a[0]) ?? 0) - (variantOrder.get(b[0]) ?? 0),
      ),
      slots: c.slots,
    }));

    components.push({
      name: top.name,
      nameSpan: top.nameSpan,
      hash: hashName(rel, top.name),
      slotNames,
      base,
      variants,
      compounds,
      defaults,
      responsive,
      containers,
    });
    localTokens = null;
  }

  return {
    globals,
    components,
    styles,
    themeVars,
    themeModes,
    breakpoints: { ...env.breakpoints },
    containerSizes: { ...env.containers },
    keyframes,
  };
}

function pruneEmpty(slots: Record<string, StyleIR>) {
  for (const key of Object.keys(slots)) {
    if (isEmptyStyle(slots[key]!)) delete slots[key];
  }
}
