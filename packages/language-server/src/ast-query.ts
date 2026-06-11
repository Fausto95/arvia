import type {
  ArviaFile,
  ComponentDecl,
  Declaration,
  DefaultEntry,
  KeyframesDecl,
  RawValue,
  RecipeDecl,
  Span,
  StyleBody,
  StyleDecl,
  StyleItem,
  TokenGroup,
  ValueWord,
  VariantDecl,
  VariantValue,
} from "@arviahq/compiler";

export type RefWord = Extract<ValueWord, { kind: "ref" }>;

export type AstTarget =
  | { kind: "token-ref"; word: RefWord; component: ComponentDecl | null }
  | { kind: "use-recipe"; name: string; span: Span }
  | {
      kind: "token-entry";
      group: TokenGroup;
      name: string;
      span: Span;
      value: string;
      doc: string | null;
      owner: "theme" | "component";
      component: ComponentDecl | null;
    }
  | { kind: "component-name"; component: ComponentDecl }
  | { kind: "style-name"; style: StyleDecl }
  | { kind: "recipe-name"; recipe: RecipeDecl }
  | { kind: "keyframes-name"; keyframes: KeyframesDecl }
  | { kind: "variant-name"; component: ComponentDecl; variant: VariantDecl }
  | {
      kind: "variant-value-name";
      component: ComponentDecl;
      variant: VariantDecl;
      value: VariantValue;
    }
  | { kind: "slot-name"; component: ComponentDecl; name: string; span: Span }
  | {
      kind: "variant-setting";
      component: ComponentDecl;
      entry: DefaultEntry;
      part: "variant" | "value";
      context: "defaults" | "compound" | "responsive" | "container";
    }
  | {
      kind: "conditional-key";
      component: ComponentDecl;
      key: string;
      span: Span;
      context: "responsive" | "container";
    }
  | { kind: "css-property"; name: string; span: Span };

const inSpan = (offset: number, span: Span) => offset >= span.start && offset < span.end;
/** Name spans are hit-tested inclusively so a cursor at the end still matches. */
const onSpan = (offset: number, span: Span) => offset >= span.start && offset <= span.end;

export function nodeAtOffset(ast: ArviaFile, offset: number): AstTarget | null {
  for (const item of ast.items) {
    if (!inSpan(offset, item.span) && !onSpan(offset, item.span)) continue;
    switch (item.kind) {
      case "theme": {
        for (const group of item.groups) {
          const hit = tokenGroupTarget(group, offset, "theme", null);
          if (hit) return hit;
        }
        break;
      }
      case "recipe": {
        if (onSpan(offset, item.nameSpan)) return { kind: "recipe-name", recipe: item };
        const hit = styleItemsTarget(item.items, offset, null);
        if (hit) return hit;
        break;
      }
      case "keyframes": {
        if (onSpan(offset, item.nameSpan)) return { kind: "keyframes-name", keyframes: item };
        for (const step of item.steps) {
          for (const decl of step.decls) {
            const hit = declTarget(decl, offset, null);
            if (hit) return hit;
          }
        }
        break;
      }
      case "styledecl": {
        if (onSpan(offset, item.nameSpan)) return { kind: "style-name", style: item };
        const hit = styleItemsTarget(item.items, offset, null);
        if (hit) return hit;
        break;
      }
      case "component": {
        const hit = componentTarget(item, offset);
        if (hit) return hit;
        break;
      }
      case "global": {
        for (const rule of item.rules) {
          for (const decl of rule.decls) {
            const hit = declTarget(decl, offset, null);
            if (hit) return hit;
          }
        }
        break;
      }
    }
  }
  return null;
}

function componentTarget(component: ComponentDecl, offset: number): AstTarget | null {
  if (onSpan(offset, component.nameSpan)) return { kind: "component-name", component };

  for (const item of component.items) {
    switch (item.kind) {
      case "decl": {
        const hit = declTarget(item, offset, component);
        if (hit) return hit;
        break;
      }
      case "use":
        if (onSpan(offset, item.recipeSpan)) {
          return { kind: "use-recipe", name: item.recipe, span: item.recipeSpan };
        }
        break;
      case "base": {
        const hit = styleBodyTarget(item.body, offset, component);
        if (hit) return hit;
        break;
      }
      case "slots": {
        for (const slot of item.slots) {
          if (onSpan(offset, slot.nameSpan)) {
            return { kind: "slot-name", component, name: slot.name, span: slot.nameSpan };
          }
          const hit = styleItemsTarget(slot.items, offset, component);
          if (hit) return hit;
        }
        break;
      }
      case "variants": {
        for (const variant of item.variants) {
          if (onSpan(offset, variant.nameSpan)) return { kind: "variant-name", component, variant };
          for (const value of variant.values) {
            if (onSpan(offset, value.nameSpan)) {
              return { kind: "variant-value-name", component, variant, value };
            }
            const hit = styleBodyTarget(value.body, offset, component);
            if (hit) return hit;
          }
        }
        break;
      }
      case "defaults": {
        const hit = settingsTarget(item.entries, offset, component, "defaults");
        if (hit) return hit;
        break;
      }
      case "responsive": {
        for (const entry of item.entries) {
          if (onSpan(offset, entry.breakpointSpan)) {
            return {
              kind: "conditional-key",
              component,
              key: entry.breakpoint,
              span: entry.breakpointSpan,
              context: "responsive",
            };
          }
          const hit = settingsTarget(entry.variants, offset, component, "responsive");
          if (hit) return hit;
        }
        break;
      }
      case "container": {
        for (const entry of item.entries) {
          if (onSpan(offset, entry.containerSpan)) {
            return {
              kind: "conditional-key",
              component,
              key: entry.container,
              span: entry.containerSpan,
              context: "container",
            };
          }
          const hit = settingsTarget(entry.variants, offset, component, "container");
          if (hit) return hit;
        }
        break;
      }
      case "compound": {
        const hit = settingsTarget(item.matchers, offset, component, "compound");
        if (hit) return hit;
        for (const slot of item.slots) {
          if (onSpan(offset, slot.nameSpan)) {
            return { kind: "slot-name", component, name: slot.name, span: slot.nameSpan };
          }
          const inner = styleItemsTarget(slot.items, offset, component);
          if (inner) return inner;
        }
        break;
      }
      case "tokens": {
        for (const group of item.groups) {
          const hit = tokenGroupTarget(group, offset, "component", component);
          if (hit) return hit;
        }
        break;
      }
    }
  }
  return null;
}

function tokenGroupTarget(
  group: TokenGroup,
  offset: number,
  owner: "theme" | "component",
  component: ComponentDecl | null,
): AstTarget | null {
  const entries = [...group.entries, ...group.overrides.flatMap((o) => o.entries)];
  for (const entry of entries) {
    // Alias refs inside the entry value (`accent = color.base;`).
    const valueHit = valueTarget(entry.value, offset, component);
    if (valueHit) return valueHit;
    if (onSpan(offset, entry.nameSpan)) {
      return {
        kind: "token-entry",
        group,
        name: entry.name,
        span: entry.nameSpan,
        value: entry.value.text,
        doc: entry.doc,
        owner,
        component,
      };
    }
  }
  return null;
}

function styleBodyTarget(
  body: StyleBody,
  offset: number,
  component: ComponentDecl | null,
): AstTarget | null {
  for (const item of body.items) {
    if (item.kind === "slotblock") {
      if (component && onSpan(offset, item.nameSpan)) {
        return { kind: "slot-name", component, name: item.name, span: item.nameSpan };
      }
      const hit = styleItemsTarget(item.items, offset, component);
      if (hit) return hit;
    } else {
      const hit = styleItemsTarget([item], offset, component);
      if (hit) return hit;
    }
  }
  return null;
}

function styleItemsTarget(
  items: StyleItem[],
  offset: number,
  component: ComponentDecl | null,
): AstTarget | null {
  for (const item of items) {
    if (item.kind === "decl") {
      const hit = declTarget(item, offset, component);
      if (hit) return hit;
    } else if (item.kind === "use") {
      if (onSpan(offset, item.recipeSpan)) {
        return { kind: "use-recipe", name: item.recipe, span: item.recipeSpan };
      }
    } else {
      for (const decl of item.items) {
        const hit = declTarget(decl, offset, component);
        if (hit) return hit;
      }
      // Cross-slot blocks inside states ("group hover").
      for (const slot of item.slots) {
        if (component && onSpan(offset, slot.nameSpan)) {
          return { kind: "slot-name", component, name: slot.name, span: slot.nameSpan };
        }
        for (const decl of slot.items) {
          if (decl.kind !== "decl") continue;
          const hit = declTarget(decl, offset, component);
          if (hit) return hit;
        }
      }
    }
  }
  return null;
}

function declTarget(
  decl: Declaration,
  offset: number,
  component: ComponentDecl | null,
): AstTarget | null {
  const propSpan: Span = {
    start: decl.span.start,
    end: decl.span.start + decl.property.length,
    line: decl.span.line,
    col: decl.span.col,
  };
  if (onSpan(offset, propSpan)) {
    return { kind: "css-property", name: decl.property, span: propSpan };
  }
  return valueTarget(decl.value, offset, component);
}

function valueTarget(
  value: RawValue,
  offset: number,
  component: ComponentDecl | null,
): AstTarget | null {
  if (!onSpan(offset, value.span)) return null;
  for (const word of value.words) {
    if (word.kind === "ref" && onSpan(offset, word.span)) {
      return { kind: "token-ref", word, component };
    }
  }
  return null;
}

function settingsTarget(
  entries: DefaultEntry[],
  offset: number,
  component: ComponentDecl,
  context: "defaults" | "compound" | "responsive" | "container",
): AstTarget | null {
  for (const entry of entries) {
    if (onSpan(offset, entry.variantSpan)) {
      return { kind: "variant-setting", component, entry, part: "variant", context };
    }
    if (onSpan(offset, entry.valueSpan)) {
      return { kind: "variant-setting", component, entry, part: "value", context };
    }
  }
  return null;
}
