import { pathToFileURL } from "node:url";
import type { Location } from "vscode-languageserver";
import type { ArviaFile, LineIndex, Span } from "@arviahq/compiler";
import { nodeAtOffset } from "./ast-query.js";
import type { DocumentAnalysis } from "./documents.js";
import { findLocalToken } from "./hover.js";
import type { WorkspaceState } from "./workspace.js";

export function getDefinition(
  analysis: DocumentAnalysis,
  offset: number,
  workspace: WorkspaceState,
): Location | null {
  const target = nodeAtOffset(analysis.ast, offset);
  if (!target) return null;

  const theme = workspace.themeFor(analysis.file);
  const isThemeDoc = theme !== null && theme.path === analysis.file;

  const local = (span: Span): Location => locationFor(analysis.file, analysis.index, span);
  const inTheme = (span: Span): Location | null =>
    theme && !isThemeDoc ? locationFor(theme.path, theme.index, span) : null;

  switch (target.kind) {
    case "token-ref": {
      if (target.word.group === "keyframes") {
        const own = findKeyframes(analysis.ast, target.word.name);
        if (own) return local(own);
        const themed = theme && findKeyframes(theme.ast, target.word.name);
        return themed ? inTheme(themed) : null;
      }
      // Component-local tokens shadow the theme.
      if (target.component) {
        const localToken = findLocalToken(target.component, target.word.group, target.word.name);
        if (localToken) return local(localToken.span);
      }
      const own = findThemeEntry(analysis.ast, target.word.group, target.word.name);
      if (own) return local(own);
      const themed = theme && findThemeEntry(theme.ast, target.word.group, target.word.name);
      return themed ? inTheme(themed) : null;
    }
    case "use-recipe": {
      const own = findRecipe(analysis.ast, target.name);
      if (own) return local(own);
      const themed = theme && findRecipe(theme.ast, target.name);
      return themed ? inTheme(themed) : null;
    }
    case "variant-setting": {
      const variant = findVariantSpans(target.component, target.entry.variant);
      if (!variant) return null;
      if (target.part === "variant") return local(variant.nameSpan);
      const value = variant.values.find((v) => v.name === target.entry.value);
      return value ? local(value.nameSpan) : local(variant.nameSpan);
    }
    case "conditional-key": {
      const group = target.context === "responsive" ? "breakpoint" : "container";
      const own = findThemeEntry(analysis.ast, group, target.key);
      if (own) return local(own);
      const themed = theme && findThemeEntry(theme.ast, group, target.key);
      return themed ? inTheme(themed) : null;
    }
    default:
      return null;
  }
}

function locationFor(file: string, index: LineIndex, span: Span): Location {
  const range = index.spanToRange(span);
  return {
    uri: pathToFileURL(file).toString(),
    range: {
      start: { line: range.start.line - 1, character: range.start.col - 1 },
      end: { line: range.end.line - 1, character: range.end.col - 1 },
    },
  };
}

function findThemeEntry(ast: ArviaFile, group: string, name: string): Span | null {
  for (const item of ast.items) {
    if (item.kind !== "theme") continue;
    for (const g of item.groups) {
      if (g.name !== group) continue;
      for (const entry of g.entries) {
        if (entry.name === name) return entry.nameSpan;
      }
    }
  }
  return null;
}

function findRecipe(ast: ArviaFile, name: string): Span | null {
  for (const item of ast.items) {
    if (item.kind === "recipe" && item.name === name) return item.nameSpan;
  }
  return null;
}

function findKeyframes(ast: ArviaFile, name: string): Span | null {
  for (const item of ast.items) {
    if (item.kind === "keyframes" && item.name === name) return item.nameSpan;
  }
  return null;
}

function findVariantSpans(
  component: import("@arviahq/compiler").ComponentDecl,
  name: string,
): { nameSpan: Span; values: { name: string; nameSpan: Span }[] } | null {
  for (const item of component.items) {
    if (item.kind !== "variants") continue;
    const variant = item.variants.find((v) => v.name === name);
    if (variant) {
      return {
        nameSpan: variant.nameSpan,
        values: variant.values.map((v) => ({ name: v.name, nameSpan: v.nameSpan })),
      };
    }
  }
  return null;
}
