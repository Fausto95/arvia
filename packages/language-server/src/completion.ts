import type { CompletionItem } from "vscode-languageserver";
import { CompletionItemKind } from "vscode-languageserver";
import type { ComponentDecl, ThemeEnv } from "@arviahq/compiler";
import { allCssProperties, propertyDescription } from "./cssdata.js";
import type { DocumentAnalysis } from "./documents.js";

const SECTION_KEYWORDS = [
  "base",
  "slots",
  "variants",
  "defaults",
  "responsive",
  "container",
  "compound",
  "tokens",
];
const TOP_KEYWORDS = ["theme", "global", "recipe", "keyframes", "style", "component"];
const DEFAULT_GROUPS = [
  "color",
  "space",
  "radius",
  "font",
  "breakpoint",
  "container",
  "duration",
  "easing",
];

function item(label: string, kind: CompletionItemKind, detail?: string): CompletionItem {
  return { label, kind, detail };
}

function tokenKind(group: string, value: string): CompletionItemKind {
  return group === "color" || /^#|rgb|hsl|oklch/.test(value)
    ? CompletionItemKind.Color
    : CompletionItemKind.Constant;
}

/** Returns the component whose span contains the offset, if any. */
function enclosingComponent(analysis: DocumentAnalysis, offset: number): ComponentDecl | null {
  for (const top of analysis.ast.items) {
    if (top.kind === "component" && offset >= top.span.start && offset <= top.span.end) {
      return top;
    }
  }
  return null;
}

function localTokenGroups(component: ComponentDecl | null): Map<string, Map<string, string>> {
  const groups = new Map<string, Map<string, string>>();
  if (!component) return groups;
  for (const part of component.items) {
    if (part.kind !== "tokens") continue;
    for (const group of part.groups) {
      const bucket = groups.get(group.name) ?? new Map<string, string>();
      for (const entry of group.entries) bucket.set(entry.name, entry.value.text);
      groups.set(group.name, bucket);
    }
  }
  return groups;
}

function tokenValueOf(env: ThemeEnv, group: string, name: string): string {
  const entry = env.tokens[group]?.[name];
  if (entry === undefined) return "";
  if (typeof entry === "string") return entry;
  return Object.entries(entry)
    .map(([mode, value]) => `${mode}: ${value}`)
    .join(", ");
}

export function getCompletions(analysis: DocumentAnalysis, offset: number): CompletionItem[] {
  const source = analysis.source;
  const env = analysis.env;
  const before = source.slice(0, offset);
  const lineStart = before.lastIndexOf("\n") + 1;
  const linePrefix = before.slice(lineStart);
  const component = enclosingComponent(analysis, offset);
  const locals = localTokenGroups(component);

  const items: CompletionItem[] = [];

  // `<group>.` → token names with values.
  const groupDot = linePrefix.match(/([A-Za-z_][A-Za-z0-9_-]*)\.$/);
  if (groupDot) {
    const group = groupDot[1]!;
    const localBucket = locals.get(group);
    if (localBucket) {
      for (const [name, value] of localBucket) {
        items.push({
          label: name,
          kind: tokenKind(group, value),
          detail: `${value} — local to ${component!.name}`,
        });
      }
    }
    const bucket = env.tokens[group];
    if (bucket) {
      for (const name of Object.keys(bucket)) {
        if (localBucket?.has(name)) continue;
        const value = tokenValueOf(env, group, name);
        const doc = env.tokenDocs[group]?.[name];
        items.push({
          label: name,
          kind: tokenKind(group, value),
          detail: value,
          documentation: doc,
        });
      }
    }
    if (group === "keyframes") {
      for (const name of Object.keys(env.keyframes)) {
        items.push(item(name, CompletionItemKind.Event, "keyframes"));
      }
    }
    if (items.length > 0) return items;
  }

  // `use ` → recipes from the merged env (file + theme).
  if (/\buse\s+$/.test(linePrefix)) {
    for (const [name, recipe] of Object.entries(env.recipes)) {
      items.push(item(name, CompletionItemKind.Reference, `recipe — ${recipe.decls.length} decls`));
    }
    return items;
  }

  // `@` inside token groups → declared mode names.
  if (linePrefix.endsWith("@")) {
    for (const mode of env.modes ?? []) {
      items.push(item(mode, CompletionItemKind.EnumMember, "theme mode"));
    }
    return items;
  }

  const atBlockStart = /^\s*$/.test(linePrefix) && before.trimEnd().endsWith("{");
  if (atBlockStart) {
    if (/\b(theme|tokens)\s*\{\s*$/.test(before.slice(-40))) {
      if (/\btheme\s*\{\s*$/.test(before.slice(-40))) {
        items.push(item("modes:", CompletionItemKind.Keyword, "light | dark;"));
      }
      const groups = new Set([...DEFAULT_GROUPS, ...Object.keys(env.tokens)]);
      for (const group of groups) {
        items.push(item(group, CompletionItemKind.Module, "token group"));
      }
    }
    if (/\bcomponent\s+[\w$]+\s*\{\s*$/.test(before)) {
      for (const kw of SECTION_KEYWORDS) {
        items.push(item(kw, CompletionItemKind.Keyword));
      }
    }
    if (/\b(defaults|compound)\s*\{\s*$/.test(before.slice(-24)) && component) {
      for (const variant of variantsOf(component)) {
        items.push(item(variant.name, CompletionItemKind.Enum, variant.values.join(" | ")));
      }
    }
    if (/\bresponsive\s*\{\s*$/.test(before.slice(-20))) {
      for (const [bp, size] of Object.entries(env.breakpoints)) {
        items.push(item(bp, CompletionItemKind.Variable, `min-width: ${size}`));
      }
    }
    if (/\bcontainer\s*\{\s*$/.test(before.slice(-20))) {
      for (const [cq, size] of Object.entries(env.containers)) {
        items.push(item(cq, CompletionItemKind.Variable, `min-width: ${size}`));
      }
    }
    if (items.length > 0) return items;
  }

  // `variant: ` inside defaults/compound/responsive/container → value names.
  const settingMatch = linePrefix.match(/^\s*([A-Za-z_][\w$-]*)\s*:\s*$/);
  if (settingMatch && component) {
    const variant = variantsOf(component).find((v) => v.name === settingMatch[1]);
    if (variant) {
      for (const value of variant.values) {
        items.push(item(value, CompletionItemKind.EnumMember, `value of ${variant.name}`));
      }
      return items;
    }
  }

  // Value position: token groups + CSS keywords.
  if (/:\s*[^;]*$/.test(linePrefix)) {
    const groups = new Set([...Object.keys(env.tokens), ...locals.keys()]);
    for (const group of groups) {
      items.push(item(group, CompletionItemKind.Module, "token group"));
    }
    if (Object.keys(env.keyframes).length > 0) {
      items.push(item("keyframes", CompletionItemKind.Module, "animations"));
    }
    return items;
  }

  // Property/keyword position: the full MDN-sourced property list.
  for (const prop of allCssProperties()) {
    items.push({
      label: prop.name,
      kind: CompletionItemKind.Property,
      detail: prop.syntax,
      documentation: propertyDescription(prop) || undefined,
    });
  }
  if (items.length > 0 && component) return items;

  for (const kw of [...TOP_KEYWORDS, ...SECTION_KEYWORDS, "use"]) {
    items.push(item(kw, CompletionItemKind.Keyword));
  }
  return items;
}

function variantsOf(component: ComponentDecl): { name: string; values: string[] }[] {
  const out: { name: string; values: string[] }[] = [];
  for (const part of component.items) {
    if (part.kind !== "variants") continue;
    for (const variant of part.variants) {
      out.push({ name: variant.name, values: variant.values.map((v) => v.name) });
    }
  }
  return out;
}
