import type {
  ArviaFile,
  ComponentDecl,
  Declaration,
  RawValue,
  Span,
  StyleItem,
  TokenEntry,
  TokenGroup,
} from "@arviahq/compiler";

export interface DeclVisit {
  decl: Declaration;
  component: ComponentDecl | null;
}

export interface EntryVisit {
  entry: TokenEntry;
  group: TokenGroup;
  owner: "theme" | "component";
  component: ComponentDecl | null;
}

/** Every CSS declaration in the file, with its owning component (if any). */
export function walkDeclarations(ast: ArviaFile): DeclVisit[] {
  const out: DeclVisit[] = [];
  const visitItems = (items: StyleItem[], component: ComponentDecl | null) => {
    for (const item of items) {
      if (item.kind === "decl") out.push({ decl: item, component });
      else if (item.kind === "state") {
        for (const decl of item.items) out.push({ decl, component });
        for (const slot of item.slots) {
          for (const decl of slot.items) {
            if (decl.kind === "decl") out.push({ decl, component });
          }
        }
      }
    }
  };

  for (const top of ast.items) {
    switch (top.kind) {
      case "global":
        for (const rule of top.rules) {
          for (const decl of rule.decls) out.push({ decl, component: null });
        }
        break;
      case "keyframes":
        for (const step of top.steps) {
          for (const decl of step.decls) out.push({ decl, component: null });
        }
        break;
      case "recipe":
      case "styledecl":
        visitItems(top.items, null);
        break;
      case "component": {
        for (const item of top.items) {
          switch (item.kind) {
            case "decl":
              out.push({ decl: item, component: top });
              break;
            case "base":
              for (const part of item.body.items) {
                if (part.kind === "slotblock") visitItems(part.items, top);
                else visitItems([part], top);
              }
              break;
            case "slots":
              for (const slot of item.slots) visitItems(slot.items, top);
              break;
            case "variants":
              for (const variant of item.variants) {
                for (const value of variant.values) {
                  for (const part of value.body.items) {
                    if (part.kind === "slotblock") visitItems(part.items, top);
                    else visitItems([part], top);
                  }
                }
              }
              break;
            case "compound":
              for (const slot of item.slots) visitItems(slot.items, top);
              break;
          }
        }
        break;
      }
    }
  }
  return out;
}

/** Every token entry (theme + component tokens, incl. mode overrides). */
export function walkTokenEntries(ast: ArviaFile): EntryVisit[] {
  const out: EntryVisit[] = [];
  const visitGroup = (
    group: TokenGroup,
    owner: "theme" | "component",
    component: ComponentDecl | null,
  ) => {
    for (const entry of group.entries) out.push({ entry, group, owner, component });
    for (const override of group.overrides) {
      for (const entry of override.entries) out.push({ entry, group, owner, component });
    }
  };
  for (const top of ast.items) {
    if (top.kind === "theme") {
      for (const group of top.groups) visitGroup(group, "theme", null);
    }
    if (top.kind === "component") {
      for (const item of top.items) {
        if (item.kind !== "tokens") continue;
        for (const group of item.groups) visitGroup(group, "component", top);
      }
    }
  }
  return out;
}

/** Every RawValue in the file (declaration values + token entry values). */
export function walkValues(ast: ArviaFile): { value: RawValue; component: ComponentDecl | null }[] {
  return [
    ...walkDeclarations(ast).map(({ decl, component }) => ({ value: decl.value, component })),
    ...walkTokenEntries(ast).map(({ entry, component }) => ({ value: entry.value, component })),
  ];
}

/** Every `use Recipe;` statement in the file. */
export function walkUses(ast: ArviaFile): { recipe: string; recipeSpan: Span }[] {
  const out: { recipe: string; recipeSpan: Span }[] = [];
  const visitItems = (items: StyleItem[]) => {
    for (const item of items) {
      if (item.kind === "use") out.push({ recipe: item.recipe, recipeSpan: item.recipeSpan });
    }
  };
  for (const top of ast.items) {
    switch (top.kind) {
      case "recipe":
      case "styledecl":
        visitItems(top.items);
        break;
      case "component":
        for (const item of top.items) {
          if (item.kind === "use") out.push({ recipe: item.recipe, recipeSpan: item.recipeSpan });
          if (item.kind === "base") {
            for (const part of item.body.items) {
              if (part.kind === "slotblock") visitItems(part.items);
              else visitItems([part]);
            }
          }
          if (item.kind === "slots") {
            for (const slot of item.slots) visitItems(slot.items);
          }
          if (item.kind === "variants") {
            for (const variant of item.variants) {
              for (const value of variant.values) {
                for (const part of value.body.items) {
                  if (part.kind === "slotblock") visitItems(part.items);
                  else visitItems([part]);
                }
              }
            }
          }
          if (item.kind === "compound") {
            for (const slot of item.slots) visitItems(slot.items);
          }
        }
        break;
    }
  }
  return out;
}
