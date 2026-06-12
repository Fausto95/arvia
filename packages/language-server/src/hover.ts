import type { Hover, Range } from "vscode-languageserver";
import { MarkupKind } from "vscode-languageserver-types";
import type { ArviaFile, ComponentDecl, Span, ThemeEnv } from "@arviahq/compiler";
import { nodeAtOffset, type AstTarget, type RefWord } from "./ast-query.js";
import { cssPropertyHover } from "./cssdata.js";
import type { DocumentAnalysis } from "./documents.js";
import type { ThemeHost } from "./theme-host.js";

export function getHover(
  analysis: DocumentAnalysis,
  offset: number,
  workspace: ThemeHost,
): Hover | null {
  const target = nodeAtOffset(analysis.ast, offset);
  if (!target) return null;
  const markdown = renderHover(target, analysis, workspace);
  if (!markdown) return null;
  return {
    contents: { kind: MarkupKind.Markdown, value: markdown },
    range: rangeOf(analysis, targetSpan(target)),
  };
}

function targetSpan(target: AstTarget): Span {
  switch (target.kind) {
    case "token-ref":
      return target.word.span;
    case "use-recipe":
    case "slot-name":
    case "conditional-key":
    case "token-entry":
      return target.span;
    case "component-name":
      return target.component.nameSpan;
    case "style-name":
      return target.style.nameSpan;
    case "recipe-name":
      return target.recipe.nameSpan;
    case "keyframes-name":
      return target.keyframes.nameSpan;
    case "variant-name":
      return target.variant.nameSpan;
    case "variant-value-name":
      return target.value.nameSpan;
    case "variant-setting":
      return target.part === "variant" ? target.entry.variantSpan : target.entry.valueSpan;
    case "css-property":
      return target.span;
  }
}

export function rangeOf(analysis: DocumentAnalysis, span: Span): Range {
  const range = analysis.index.spanToRange(span);
  return {
    start: { line: range.start.line - 1, character: range.start.col - 1 },
    end: { line: range.end.line - 1, character: range.end.col - 1 },
  };
}

function renderHover(
  target: AstTarget,
  analysis: DocumentAnalysis,
  workspace: ThemeHost,
): string | null {
  const env = analysis.env;
  switch (target.kind) {
    case "token-ref":
      return target.word.group === "keyframes"
        ? keyframesRefHover(target.word, analysis, workspace)
        : tokenRefHover(target.word, target.component, env);
    case "use-recipe":
      return recipeHover(target.name, env);
    case "recipe-name":
      return recipeHover(target.recipe.name, env);
    case "token-entry": {
      const heading =
        target.owner === "component"
          ? `**${target.group.name}.${target.name}** — local to \`${target.component?.name}\``
          : `**${target.group.name}.${target.name}**`;
      const doc = target.doc ? `\n\n${target.doc}` : "";
      return `${heading}\n\n\`\`\`css\n${target.value}\n\`\`\`${doc}`;
    }
    case "component-name":
      return componentHover(target.component);
    case "style-name":
      return `**style ${target.style.name}** — exported class\n\n\`\`\`ts\nexport const ${target.style.name}: string;\n\`\`\``;
    case "keyframes-name":
      return keyframesDeclHover(target.keyframes.name, analysis.ast);
    case "variant-name": {
      const values = target.variant.values.map((v) => v.name).join(" | ");
      return `**variant ${target.variant.name}** of \`${target.component.name}\`\n\n\`\`\`ts\n${target.variant.name}?: ${values || "never"}\n\`\`\``;
    }
    case "variant-value-name":
      return `**${target.variant.name}: ${target.value.name}** — variant value of \`${target.component.name}\``;
    case "slot-name":
      return `**slot ${target.name}** of \`${target.component.name}\``;
    case "variant-setting": {
      const variant = findVariant(target.component, target.entry.variant);
      if (!variant) return null;
      if (target.part === "variant") {
        const values = variant.values.map((v) => v.name).join(" | ");
        return `**variant ${variant.name}** of \`${target.component.name}\`\n\n\`\`\`ts\n${variant.name}?: ${values || "never"}\n\`\`\``;
      }
      return `**${target.entry.variant}: ${target.entry.value}** (${target.context})`;
    }
    case "conditional-key": {
      const size =
        target.context === "responsive" ? env.breakpoints[target.key] : env.containers[target.key];
      const label = target.context === "responsive" ? "breakpoint" : "container size";
      return size ? `**${label} ${target.key}**\n\n\`\`\`css\nmin-width: ${size}\n\`\`\`` : null;
    }
    case "css-property":
      return cssPropertyHover(target.name);
  }
}

function tokenRefHover(
  word: RefWord,
  component: ComponentDecl | null,
  env: ThemeEnv,
): string | null {
  // Component-local tokens shadow the theme.
  const local = component ? findLocalToken(component, word.group, word.name) : null;
  if (local) {
    const doc = local.doc ? `\n\n${local.doc}` : "";
    return `**${word.group}.${word.name}** — local to \`${component!.name}\`\n\n\`\`\`css\n${local.value}\n\`\`\`${doc}`;
  }

  const entry = env.tokens[word.group]?.[word.name];
  if (entry === undefined) return null;

  let body: string;
  if (typeof entry === "string") {
    body = `\`\`\`css\n${entry}\n\`\`\``;
  } else {
    const rows = Object.entries(entry)
      .map(([mode, value]) => `| ${mode} | \`${value}\` |`)
      .join("\n");
    body = `| mode | value |\n| --- | --- |\n${rows}`;
  }

  const doc = env.tokenDocs[word.group]?.[word.name];
  const docLine = doc ? `\n\n${doc}` : "";
  const cssVar = env.modes ? `\n\n\`var(--arvia-${word.group}-${word.name})\`` : "";
  return `**${word.group}.${word.name}**\n\n${body}${docLine}${cssVar}`;
}

function recipeHover(name: string, env: ThemeEnv): string | null {
  const recipe = env.recipes[name];
  if (!recipe) return null;
  const shown = recipe.decls.slice(0, 8);
  const lines = shown.map((d) => `${d.property}: ${d.value};`);
  if (recipe.decls.length > shown.length) {
    lines.push(`/* +${recipe.decls.length - shown.length} more */`);
  }
  const selectorList = recipe.states
    .flatMap((s) => s.selectors)
    .map((sel) => `\`&${sel.trim()}\``)
    .join(", ");
  const states =
    recipe.states.length > 0
      ? `\n\n${recipe.states.length} state${recipe.states.length === 1 ? "" : "s"}: ${selectorList}`
      : "";
  return `**recipe ${name}**\n\n\`\`\`css\n${lines.join("\n")}\n\`\`\`${states}`;
}

function componentHover(component: ComponentDecl): string {
  const slots = new Set<string>(["root"]);
  const variants: string[] = [];
  for (const item of component.items) {
    if (item.kind === "slots") {
      for (const slot of item.slots) slots.add(slot.name);
    }
    if (item.kind === "variants") {
      for (const variant of item.variants) {
        variants.push(`${variant.name}: ${variant.values.map((v) => v.name).join(" | ")}`);
      }
    }
  }
  const lines = [
    `slots: ${[...slots].join(", ")}`,
    ...(variants.length > 0 ? variants : ["(no variants)"]),
  ];
  return `**component ${component.name}**\n\n\`\`\`\n${lines.join("\n")}\n\`\`\``;
}

function keyframesRefHover(
  word: RefWord,
  analysis: DocumentAnalysis,
  workspace: ThemeHost,
): string | null {
  const local = keyframesDeclHover(word.name, analysis.ast);
  if (local) return local;
  const theme = workspace.themeFor(analysis.file);
  return theme ? keyframesDeclHover(word.name, theme.ast) : null;
}

function keyframesDeclHover(name: string, ast: ArviaFile): string | null {
  for (const item of ast.items) {
    if (item.kind !== "keyframes" || item.name !== name) continue;
    const steps = item.steps.map((s) => s.selector).join(" → ");
    return `**keyframes ${name}**\n\n\`\`\`\n${steps || "(no steps)"}\n\`\`\``;
  }
  return null;
}

function findVariant(component: ComponentDecl, name: string) {
  for (const item of component.items) {
    if (item.kind !== "variants") continue;
    const variant = item.variants.find((v) => v.name === name);
    if (variant) return variant;
  }
  return undefined;
}

export function findLocalToken(
  component: ComponentDecl,
  group: string,
  name: string,
): { value: string; doc: string | null; span: Span } | null {
  for (const item of component.items) {
    if (item.kind !== "tokens") continue;
    for (const g of item.groups) {
      if (g.name !== group) continue;
      for (const entry of g.entries) {
        if (entry.name === name) {
          return { value: entry.value.text, doc: entry.doc, span: entry.nameSpan };
        }
      }
    }
  }
  return null;
}
