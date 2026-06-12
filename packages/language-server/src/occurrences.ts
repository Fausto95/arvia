import type { ArviaFile, ComponentDecl, Span } from "@arviahq/compiler";
import { nodeAtOffset } from "./ast-query.js";
import type { DocumentAnalysis } from "./documents.js";
import { findLocalToken } from "./hover.js";
import { walkDeclarations, walkTokenEntries, walkUses, walkValues } from "./walk.js";

/** A renameable/referenceable symbol. Components and styles are TS exports
 *  and are deliberately not represented here (tsserver owns their edits). */
export type SymbolIdentity =
  | { kind: "token"; group: string; name: string; component: ComponentDecl | null }
  | { kind: "recipe"; name: string }
  | { kind: "keyframes"; name: string }
  | { kind: "variant"; component: ComponentDecl; name: string }
  | { kind: "variant-value"; component: ComponentDecl; variant: string; name: string }
  | { kind: "slot"; component: ComponentDecl; name: string };

export interface Occurrence {
  span: Span;
  role: "declaration" | "reference";
  /** Prefix the span's text carries before the bare name (`color.`,
   *  `keyframes.`) — rename re-emits it in front of the new name. */
  refPrefix?: string;
}

/** Identity kinds that may propagate beyond the declaring file via the
 *  shared theme. */
export const crossFileKinds = new Set(["token", "recipe", "keyframes"]);

export function identityAt(
  analysis: DocumentAnalysis,
  offset: number,
): { identity: SymbolIdentity; span: Span; placeholder: string } | null {
  const target = nodeAtOffset(analysis.ast, offset);
  if (!target) return null;
  switch (target.kind) {
    case "token-ref": {
      if (target.word.group === "keyframes") {
        return {
          identity: { kind: "keyframes", name: target.word.name },
          span: target.word.span,
          placeholder: target.word.name,
        };
      }
      const local = target.component
        ? findLocalToken(target.component, target.word.group, target.word.name)
        : null;
      return {
        identity: {
          kind: "token",
          group: target.word.group,
          name: target.word.name,
          component: local ? target.component : null,
        },
        span: target.word.span,
        placeholder: target.word.name,
      };
    }
    case "token-entry":
      return {
        identity: {
          kind: "token",
          group: target.group.name,
          name: target.name,
          component: target.owner === "component" ? target.component : null,
        },
        span: target.span,
        placeholder: target.name,
      };
    case "use-recipe":
      return {
        identity: { kind: "recipe", name: target.name },
        span: target.span,
        placeholder: target.name,
      };
    case "recipe-name":
      return {
        identity: { kind: "recipe", name: target.recipe.name },
        span: target.recipe.nameSpan,
        placeholder: target.recipe.name,
      };
    case "keyframes-name":
      return {
        identity: { kind: "keyframes", name: target.keyframes.name },
        span: target.keyframes.nameSpan,
        placeholder: target.keyframes.name,
      };
    case "variant-name":
      return {
        identity: { kind: "variant", component: target.component, name: target.variant.name },
        span: target.variant.nameSpan,
        placeholder: target.variant.name,
      };
    case "variant-value-name":
      return {
        identity: {
          kind: "variant-value",
          component: target.component,
          variant: target.variant.name,
          name: target.value.name,
        },
        span: target.value.nameSpan,
        placeholder: target.value.name,
      };
    case "variant-setting": {
      if (target.part === "variant") {
        return {
          identity: { kind: "variant", component: target.component, name: target.entry.variant },
          span: target.entry.variantSpan,
          placeholder: target.entry.variant,
        };
      }
      return {
        identity: {
          kind: "variant-value",
          component: target.component,
          variant: target.entry.variant,
          name: target.entry.value,
        },
        span: target.entry.valueSpan,
        placeholder: target.entry.value,
      };
    }
    case "slot-name":
      return {
        identity: { kind: "slot", component: target.component, name: target.name },
        span: target.span,
        placeholder: target.name,
      };
    default:
      return null;
  }
}

/** Every occurrence of the symbol within one file's AST, declaration and
 *  references alike, in source order per walk. */
export function occurrencesInFile(ast: ArviaFile, identity: SymbolIdentity): Occurrence[] {
  const occurrences: Occurrence[] = [];
  switch (identity.kind) {
    case "token": {
      const scoped = identity.component;
      for (const visit of walkTokenEntries(ast)) {
        if (visit.group.name !== identity.group || visit.entry.name !== identity.name) continue;
        if (scoped ? visit.component !== scoped : visit.owner !== "theme") continue;
        occurrences.push({ span: visit.entry.nameSpan, role: "declaration" });
      }
      for (const { decl, component } of walkDeclarations(ast)) {
        for (const word of decl.value.words) {
          if (word.kind !== "ref" || word.group !== identity.group || word.name !== identity.name) {
            continue;
          }
          const shadowed = component
            ? findLocalToken(component, identity.group, identity.name) !== null
            : false;
          if (scoped ? component !== scoped : shadowed) continue;
          occurrences.push({
            span: word.span,
            role: "reference",
            refPrefix: `${identity.group}.`,
          });
        }
      }
      // Theme alias values reference tokens too.
      if (!scoped) {
        for (const visit of walkTokenEntries(ast)) {
          for (const word of visit.entry.value.words) {
            if (
              word.kind === "ref" &&
              word.group === identity.group &&
              word.name === identity.name
            ) {
              occurrences.push({
                span: word.span,
                role: "reference",
                refPrefix: `${identity.group}.`,
              });
            }
          }
        }
      }
      break;
    }
    case "recipe": {
      for (const item of ast.items) {
        if (item.kind === "recipe" && item.name === identity.name) {
          occurrences.push({ span: item.nameSpan, role: "declaration" });
        }
      }
      for (const use of walkUses(ast)) {
        if (use.recipe === identity.name) {
          occurrences.push({ span: use.recipeSpan, role: "reference" });
        }
      }
      break;
    }
    case "keyframes": {
      for (const item of ast.items) {
        if (item.kind === "keyframes" && item.name === identity.name) {
          occurrences.push({ span: item.nameSpan, role: "declaration" });
        }
      }
      for (const { value } of walkValues(ast)) {
        for (const word of value.words) {
          if (word.kind === "ref" && word.group === "keyframes" && word.name === identity.name) {
            occurrences.push({ span: word.span, role: "reference", refPrefix: "keyframes." });
          }
        }
      }
      break;
    }
    case "variant":
    case "variant-value":
    case "slot": {
      const component = findComponent(ast, identity.component.name);
      if (component) occurrences.push(...componentOccurrences(component, identity));
      break;
    }
  }
  return occurrences;
}

function componentOccurrences(
  component: ComponentDecl,
  identity: Extract<SymbolIdentity, { kind: "variant" | "variant-value" | "slot" }>,
): Occurrence[] {
  const occurrences: Occurrence[] = [];
  const settingEntries = (
    entries: { variant: string; variantSpan: Span; value: string; valueSpan: Span }[],
  ) => {
    for (const entry of entries) {
      if (identity.kind === "variant" && entry.variant === identity.name) {
        occurrences.push({ span: entry.variantSpan, role: "reference" });
      }
      if (
        identity.kind === "variant-value" &&
        entry.variant === identity.variant &&
        entry.value === identity.name
      ) {
        occurrences.push({ span: entry.valueSpan, role: "reference" });
      }
    }
  };
  const slotName = (name: string, span: Span, role: Occurrence["role"] = "reference") => {
    if (identity.kind === "slot" && name === identity.name) occurrences.push({ span, role });
  };

  for (const item of component.items) {
    switch (item.kind) {
      case "slots":
        for (const slot of item.slots) slotName(slot.name, slot.nameSpan, "declaration");
        break;
      case "base":
        for (const part of item.body.items) {
          if (part.kind === "slotblock") slotName(part.name, part.nameSpan);
          if (part.kind === "state") {
            for (const slot of part.slots) slotName(slot.name, slot.nameSpan);
          }
        }
        break;
      case "variants":
        for (const variant of item.variants) {
          if (identity.kind === "variant" && variant.name === identity.name) {
            occurrences.push({ span: variant.nameSpan, role: "declaration" });
          }
          for (const value of variant.values) {
            if (
              identity.kind === "variant-value" &&
              variant.name === identity.variant &&
              value.name === identity.name
            ) {
              occurrences.push({ span: value.nameSpan, role: "declaration" });
            }
            for (const part of value.body.items) {
              if (part.kind === "slotblock") slotName(part.name, part.nameSpan);
              if (part.kind === "state") {
                for (const slot of part.slots) slotName(slot.name, slot.nameSpan);
              }
            }
          }
        }
        break;
      case "defaults":
        settingEntries(item.entries);
        break;
      case "responsive":
      case "container":
        for (const entry of item.entries) settingEntries(entry.variants);
        break;
      case "compound":
        settingEntries(item.matchers);
        for (const slot of item.slots) slotName(slot.name, slot.nameSpan);
        break;
    }
  }
  return occurrences;
}

export function findComponent(ast: ArviaFile, name: string): ComponentDecl | null {
  for (const item of ast.items) {
    if (item.kind === "component" && item.name === name) return item;
  }
  return null;
}
