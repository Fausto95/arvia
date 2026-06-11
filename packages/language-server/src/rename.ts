import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Range, TextEdit, WorkspaceEdit } from "vscode-languageserver";
import { LineIndex, parse, type ArviaFile, type ComponentDecl, type Span } from "@arviahq/compiler";
import { nodeAtOffset } from "./ast-query.js";
import type { DocumentAnalysis } from "./documents.js";
import { findLocalToken, rangeOf } from "./hover.js";
import { walkDeclarations, walkTokenEntries, walkUses, walkValues } from "./walk.js";
import type { WorkspaceState } from "./workspace.js";

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const TOKEN_NAME_RE = /^[A-Za-z0-9_][A-Za-z0-9_-]*$/;

type RenameIdentity =
  | { kind: "token"; group: string; name: string; component: ComponentDecl | null }
  | { kind: "recipe"; name: string }
  | { kind: "keyframes"; name: string }
  | { kind: "variant"; component: ComponentDecl; name: string }
  | { kind: "variant-value"; component: ComponentDecl; variant: string; name: string }
  | { kind: "slot"; component: ComponentDecl; name: string };

export function prepareRename(
  analysis: DocumentAnalysis,
  offset: number,
): { range: Range; placeholder: string } | null {
  const resolved = identityAt(analysis, offset);
  if (!resolved) return null;
  return { range: rangeOf(analysis, resolved.span), placeholder: resolved.placeholder };
}

export function getRenameEdits(
  analysis: DocumentAnalysis,
  offset: number,
  newName: string,
  workspace: WorkspaceState,
  contentFor: (file: string) => string | null,
): WorkspaceEdit | null {
  const resolved = identityAt(analysis, offset);
  if (!resolved) return null;
  const { identity } = resolved;

  const validName = identity.kind === "token" ? TOKEN_NAME_RE : NAME_RE;
  if (!validName.test(newName)) return null;

  const changes: Record<string, TextEdit[]> = {};
  const addEdits = (file: string, source: string, ast: ArviaFile) => {
    const index = new LineIndex(source);
    const edits = editsInFile(ast, identity, newName);
    if (edits.length === 0) return;
    const uri = pathToFileURL(file).toString();
    changes[uri] = edits.map(({ span, text }) => ({
      range: lspRange(index, span),
      newText: text,
    }));
  };

  // Current document first.
  addEdits(analysis.file, analysis.source, analysis.ast);

  // Shared-theme identities propagate to every file that resolves to it.
  if (crossFileKinds.has(identity.kind) && isSharedThemeMember(analysis, workspace)) {
    const themePath = path.resolve(analysis.file);
    for (const file of listArvFiles(workspace.root)) {
      const resolvedFile = path.resolve(file);
      if (resolvedFile === path.resolve(analysis.file)) continue;
      if (workspace.themePathFor(resolvedFile) !== themePath) continue;
      const source = contentFor(resolvedFile);
      if (source === null) continue;
      addEdits(resolvedFile, source, parse(source, resolvedFile).ast);
    }
  }

  return Object.keys(changes).length > 0 ? { changes } : null;
}

const crossFileKinds = new Set(["token", "recipe", "keyframes"]);

/** True when the current document is a theme other files can resolve to. */
function isSharedThemeMember(analysis: DocumentAnalysis, workspace: WorkspaceState): boolean {
  return workspace.themePathFor(analysis.file) === path.resolve(analysis.file);
}

function identityAt(
  analysis: DocumentAnalysis,
  offset: number,
): { identity: RenameIdentity; span: Span; placeholder: string } | null {
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
      // Components and styles are TS exports — renaming them here would
      // silently break .tsx imports, so it is not offered.
      return null;
  }
}

function editsInFile(
  ast: ArviaFile,
  identity: RenameIdentity,
  newName: string,
): { span: Span; text: string }[] {
  const edits: { span: Span; text: string }[] = [];
  switch (identity.kind) {
    case "token": {
      const scoped = identity.component;
      for (const visit of walkTokenEntries(ast)) {
        if (visit.group.name !== identity.group || visit.entry.name !== identity.name) continue;
        if (scoped ? visit.component !== scoped : visit.owner !== "theme") continue;
        edits.push({ span: visit.entry.nameSpan, text: newName });
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
          edits.push({ span: word.span, text: `${identity.group}.${newName}` });
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
              edits.push({ span: word.span, text: `${identity.group}.${newName}` });
            }
          }
        }
      }
      break;
    }
    case "recipe": {
      for (const item of ast.items) {
        if (item.kind === "recipe" && item.name === identity.name) {
          edits.push({ span: item.nameSpan, text: newName });
        }
      }
      for (const use of walkUses(ast)) {
        if (use.recipe === identity.name) edits.push({ span: use.recipeSpan, text: newName });
      }
      break;
    }
    case "keyframes": {
      for (const item of ast.items) {
        if (item.kind === "keyframes" && item.name === identity.name) {
          edits.push({ span: item.nameSpan, text: newName });
        }
      }
      for (const { value } of walkValues(ast)) {
        for (const word of value.words) {
          if (word.kind === "ref" && word.group === "keyframes" && word.name === identity.name) {
            edits.push({ span: word.span, text: `keyframes.${newName}` });
          }
        }
      }
      break;
    }
    case "variant":
    case "variant-value":
    case "slot": {
      const component = findComponent(ast, identity.component.name);
      if (component) edits.push(...componentEdits(component, identity, newName));
      break;
    }
  }
  return edits;
}

function componentEdits(
  component: ComponentDecl,
  identity: Extract<RenameIdentity, { kind: "variant" | "variant-value" | "slot" }>,
  newName: string,
): { span: Span; text: string }[] {
  const edits: { span: Span; text: string }[] = [];
  const settingEntries = (
    entries: { variant: string; variantSpan: Span; value: string; valueSpan: Span }[],
  ) => {
    for (const entry of entries) {
      if (identity.kind === "variant" && entry.variant === identity.name) {
        edits.push({ span: entry.variantSpan, text: newName });
      }
      if (
        identity.kind === "variant-value" &&
        entry.variant === identity.variant &&
        entry.value === identity.name
      ) {
        edits.push({ span: entry.valueSpan, text: newName });
      }
    }
  };
  const slotName = (name: string, span: Span) => {
    if (identity.kind === "slot" && name === identity.name) edits.push({ span, text: newName });
  };

  for (const item of component.items) {
    switch (item.kind) {
      case "slots":
        for (const slot of item.slots) slotName(slot.name, slot.nameSpan);
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
            edits.push({ span: variant.nameSpan, text: newName });
          }
          for (const value of variant.values) {
            if (
              identity.kind === "variant-value" &&
              variant.name === identity.variant &&
              value.name === identity.name
            ) {
              edits.push({ span: value.nameSpan, text: newName });
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
  return edits;
}

function findComponent(ast: ArviaFile, name: string): ComponentDecl | null {
  for (const item of ast.items) {
    if (item.kind === "component" && item.name === name) return item;
  }
  return null;
}

function lspRange(index: LineIndex, span: Span): Range {
  const range = index.spanToRange(span);
  return {
    start: { line: range.start.line - 1, character: range.start.col - 1 },
    end: { line: range.end.line - 1, character: range.end.col - 1 },
  };
}

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "build", "coverage"]);

export function listArvFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.name.endsWith(".arv")) {
        out.push(path.join(dir, entry.name));
      }
    }
  };
  walk(root);
  return out;
}

export function readFileOr(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}
