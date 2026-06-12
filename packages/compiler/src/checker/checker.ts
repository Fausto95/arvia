import {
  didYouMean,
  makeDiagnostic,
  replaceFix,
  type Diagnostic,
  type DiagnosticFix,
  type Span,
} from "../diagnostics.js";
import type {
  ComponentDecl,
  Declaration,
  ArviaFile,
  RawValue,
  RecipeDecl,
  StyleBody,
  StyleItem,
} from "../ast/nodes.js";
import { isKnownProperty, knownPropertyNames, matchValueSyntax } from "./css-validate.js";
import { emptyEnv, type RecipeIR, type ThemeEnv, type TokenModes } from "../ir/ir.js";
import { hashName } from "../ir/hash.js";
import {
  substituteRefs,
  substituteRefsForMode,
  type LocalTokens,
  type RefWord,
} from "../values.js";

export interface CheckOptions {
  filename: string;
  env?: ThemeEnv;
  /** CSS validation level: property names + value syntax (default), names
   *  only, or off. All CSS diagnostics are warnings. */
  css?: false | "names" | "syntax";
  /** True for the conventional shared theme file: its recipes/tokens are
   *  consumed by other files, so unused-in-file warnings are suppressed. */
  sharedEnvFile?: boolean;
}

export interface CheckResult {
  diagnostics: Diagnostic[];
  /** Merged environment: passed-in env extended/overridden by this file. */
  env: ThemeEnv;
}

const JS_IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED = new Set([
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

export function check(ast: ArviaFile, options: CheckOptions): CheckResult {
  return new Checker(ast, options).run();
}

class Checker {
  private diagnostics: Diagnostic[] = [];
  private env: ThemeEnv;
  private fileRecipes = new Map<string, RecipeDecl>();
  private resolvedRecipes = new Map<string, RecipeIR>();
  private resolving = new Set<string>();
  private fileStyleNames = new Set<string>();
  /** Component-scoped tokens, set while checking a component's declarations. */
  private localTokens: LocalTokens | null = null;
  /** `group.name` refs that hit a component token (for unused warnings). */
  private usedLocalTokens = new Set<string>();
  private usedRecipes = new Set<string>();

  constructor(
    private ast: ArviaFile,
    private options: CheckOptions,
  ) {
    const base = options.env ?? emptyEnv();
    this.env = {
      modes: base.modes,
      breakpoints: { ...base.breakpoints },
      containers: { ...base.containers },
      tokens: Object.fromEntries(
        Object.entries(base.tokens).map(([g, t]) => [
          g,
          Object.fromEntries(
            Object.entries(t).map(([n, v]) => [n, typeof v === "string" ? v : { ...v }]),
          ),
        ]),
      ),
      tokenDocs: Object.fromEntries(Object.entries(base.tokenDocs).map(([g, d]) => [g, { ...d }])),
      recipes: { ...base.recipes },
      keyframes: { ...base.keyframes },
    };
  }

  private report(
    code: string,
    message: string,
    span: Span,
    hint?: string,
    severity: "error" | "warning" = "error",
    fix?: DiagnosticFix,
  ) {
    this.diagnostics.push(
      makeDiagnostic(code, severity, message, this.options.filename, span, hint, fix),
    );
  }

  run(): CheckResult {
    this.collectTheme();
    this.collectKeyframes();
    this.collectStyleNames();
    this.collectRecipes();
    this.resolveAllRecipes();
    this.checkStyles();
    this.checkGlobals();
    this.checkComponents();
    this.checkUnusedRecipes();
    return { diagnostics: this.diagnostics, env: this.env };
  }

  /** Recipes only travel across files through the shared theme, so in any
   *  other file a recipe nobody `use`s is dead code. */
  private checkUnusedRecipes() {
    if (this.options.sharedEnvFile) return;
    for (const [name, decl] of this.fileRecipes) {
      if (this.usedRecipes.has(name)) continue;
      this.report(
        "ARV172",
        `recipe '${name}' is never used in this file`,
        decl.nameSpan,
        "only the shared theme file exports recipes to other files",
        "warning",
      );
    }
  }

  // --- theme -----------------------------------------------------------------

  private collectTheme() {
    const fileGroups = new Set<string>();
    const seenNames = new Map<string, Set<string>>();
    for (const item of this.ast.items) {
      if (item.kind !== "theme") continue;

      if (item.modes) {
        if (this.env.modes && this.env.modes.join("|") !== item.modes.join("|")) {
          this.report(
            "ARV130",
            "theme modes conflict with the shared theme environment",
            item.modesSpan ?? item.span,
          );
        } else {
          this.env.modes = [...item.modes];
        }
        if (item.modes.length < 2) {
          this.report(
            "ARV131",
            "theme modes requires at least two mode names",
            item.modesSpan ?? item.span,
          );
        }
      }

      for (const group of item.groups) {
        if (fileGroups.has(group.name)) {
          this.report("ARV112", `duplicate theme group '${group.name}'`, group.nameSpan);
        }
        fileGroups.add(group.name);

        if (group.name === "breakpoint") {
          this.collectBreakpoints(group);
          continue;
        }
        if (group.name === "container") {
          this.collectContainerSizes(group);
          continue;
        }

        const target = (this.env.tokens[group.name] ??= {});
        const docs = (this.env.tokenDocs[group.name] ??= {});
        const seen = seenNames.get(group.name) ?? new Set<string>();
        seenNames.set(group.name, seen);
        const modes = this.env.modes;

        for (const entry of group.entries) {
          if (seen.has(entry.name)) {
            this.report("ARV112", `duplicate token '${group.name}.${entry.name}'`, entry.nameSpan);
          }
          seen.add(entry.name);
          if (entry.doc) docs[entry.name] = entry.doc;
          if (modes) {
            const bucket: TokenModes = {
              [modes[0]!]: this.resolveThemeValue(entry.value, modes[0]!, modes),
            };
            target[entry.name] = bucket;
          } else {
            target[entry.name] = this.resolveThemeValue(entry.value, null, null);
          }
        }

        for (const override of group.overrides) {
          if (modes && !modes.includes(override.mode)) {
            this.report(
              "ARV132",
              `unknown theme mode '${override.mode}'`,
              override.modeSpan,
              `declared modes: ${modes.join(", ")}`,
            );
            continue;
          }
          for (const entry of override.entries) {
            if (!seen.has(entry.name)) {
              this.report(
                "ARV133",
                `mode override for undeclared token '${group.name}.${entry.name}'`,
                entry.nameSpan,
                "declare the base token before adding mode overrides",
              );
              continue;
            }
            const existing = target[entry.name]!;
            if (typeof existing === "string") {
              if (modes) {
                const bucket: TokenModes = {
                  [modes[0]!]: existing,
                  [override.mode]: this.resolveThemeValue(entry.value, override.mode, modes),
                };
                target[entry.name] = bucket;
              } else {
                this.report(
                  "ARV134",
                  `mode override '@${override.mode}' requires a 'modes:' declaration`,
                  override.modeSpan,
                );
              }
            } else {
              if (existing[override.mode] !== undefined) {
                this.report(
                  "ARV112",
                  `duplicate mode override for '${group.name}.${entry.name}' in mode '${override.mode}'`,
                  entry.nameSpan,
                );
              }
              existing[override.mode] = this.resolveThemeValue(entry.value, override.mode, modes);
            }
          }
        }
      }
    }
  }

  private collectContainerSizes(group: import("../ast/nodes.js").TokenGroup) {
    const seen = new Set<string>();
    for (const entry of group.entries) {
      if (seen.has(entry.name)) {
        this.report("ARV112", `duplicate container size '${entry.name}'`, entry.nameSpan);
      }
      seen.add(entry.name);
      this.env.containers[entry.name] = entry.value.text;
    }
    for (const override of group.overrides) {
      this.report(
        "ARV136",
        "container size tokens do not support mode overrides",
        override.modeSpan,
      );
    }
  }

  private collectKeyframes() {
    const names = new Set<string>();
    for (const item of this.ast.items) {
      if (item.kind !== "keyframes") continue;
      if (names.has(item.name)) {
        this.report("ARV150", `duplicate keyframes '${item.name}'`, item.nameSpan);
        continue;
      }
      names.add(item.name);
      for (const step of item.steps) {
        for (const decl of step.decls) this.checkDecl(decl);
      }
      const rel = this.options.filename.replace(/\\/g, "/");
      this.env.keyframes[item.name] = `${item.name}_${hashName(rel, item.name)}`;
    }
  }

  private collectBreakpoints(group: import("../ast/nodes.js").TokenGroup) {
    if (this.env.modes) {
      // breakpoint tokens are compile-time only — allowed alongside modes.
    }
    const seen = new Set<string>();
    for (const entry of group.entries) {
      if (seen.has(entry.name)) {
        this.report("ARV112", `duplicate breakpoint '${entry.name}'`, entry.nameSpan);
      }
      seen.add(entry.name);
      this.env.breakpoints[entry.name] = entry.value.text;
    }
    for (const override of group.overrides) {
      this.report("ARV135", "breakpoint tokens do not support mode overrides", override.modeSpan);
    }
  }

  /** True when this file will emit the `tokens` export (theme token groups). */
  private fileExportsTokens(): boolean {
    return this.ast.items.some(
      (item) =>
        item.kind === "theme" &&
        item.groups.some(
          (g) => g.name !== "breakpoint" && g.name !== "container" && g.entries.length > 0,
        ),
    );
  }

  // --- styles ----------------------------------------------------------------

  private collectStyleNames() {
    const componentNames = new Set<string>();
    for (const item of this.ast.items) {
      if (item.kind === "component") componentNames.add(item.name);
    }
    for (const item of this.ast.items) {
      if (item.kind !== "styledecl") continue;
      if (this.fileStyleNames.has(item.name)) {
        this.report("ARV117", `duplicate style '${item.name}'`, item.nameSpan);
        continue;
      }
      if (componentNames.has(item.name)) {
        this.report(
          "ARV117",
          `style '${item.name}' conflicts with a component of the same name`,
          item.nameSpan,
          "styles and components share the file's export namespace",
        );
      }
      this.fileStyleNames.add(item.name);
      if (!JS_IDENT_RE.test(item.name) || RESERVED.has(item.name)) {
        this.report(
          "ARV116",
          `style name '${item.name}' is not a valid JavaScript identifier`,
          item.nameSpan,
          "style names become exported constants; use letters, digits, '_' or '$'",
        );
      }
      if (item.name === "tokens" && this.fileExportsTokens()) {
        this.report(
          "ARV125",
          "style 'tokens' conflicts with the theme's generated `tokens` export",
          item.nameSpan,
          "theme-bearing files export their tokens as `tokens`; pick another name",
        );
      }
    }
  }

  /** Validates style declarations (token refs, recipe uses, states). */
  private checkStyles() {
    for (const item of this.ast.items) {
      if (item.kind !== "styledecl") continue;
      const ir: RecipeIR = { decls: [], states: [] };
      for (const styleItem of item.items) {
        this.applyStyleItem(styleItem, ir);
      }
    }
  }

  // --- recipes ---------------------------------------------------------------

  private collectRecipes() {
    for (const item of this.ast.items) {
      if (item.kind !== "recipe") continue;
      if (this.fileRecipes.has(item.name)) {
        this.report("ARV111", `duplicate recipe '${item.name}'`, item.nameSpan);
        continue;
      }
      this.fileRecipes.set(item.name, item);
    }
  }

  private resolveAllRecipes() {
    for (const name of this.fileRecipes.keys()) {
      const resolved = this.resolveRecipe(name, this.fileRecipes.get(name)!.nameSpan);
      if (resolved) this.env.recipes[name] = resolved;
    }
  }

  private resolveRecipe(name: string, refSpan: Span): RecipeIR | null {
    if (this.resolvedRecipes.has(name)) return this.resolvedRecipes.get(name)!;
    const decl = this.fileRecipes.get(name);
    if (!decl) {
      // Not in this file: fall back to the shared env (already resolved).
      const fromEnv = this.env.recipes[name];
      if (fromEnv) return fromEnv;
      if (this.fileStyleNames.has(name)) {
        this.report(
          "ARV102",
          `unknown recipe '${name}'`,
          refSpan,
          `'${name}' is a style (an exported class), not a recipe — only recipes can be inlined with 'use'`,
        );
        return null;
      }
      const hint = didYouMean(name, [...this.fileRecipes.keys(), ...Object.keys(this.env.recipes)]);
      this.report(
        "ARV102",
        `unknown recipe '${name}'`,
        refSpan,
        hint ? `did you mean '${hint}'?` : undefined,
        "error",
        hint ? replaceFix(refSpan, hint) : undefined,
      );
      return null;
    }
    if (this.resolving.has(name)) {
      this.report(
        "ARV103",
        `recipe cycle detected: '${name}' uses itself (directly or via another recipe)`,
        refSpan,
      );
      return null;
    }
    this.resolving.add(name);
    const ir: RecipeIR = { decls: [], states: [] };
    for (const item of decl.items) {
      this.applyStyleItem(item, ir);
    }
    this.resolving.delete(name);
    this.resolvedRecipes.set(name, ir);
    return ir;
  }

  /** Resolves one style item (decl / use / state) into a RecipeIR while validating. */
  private applyStyleItem(item: StyleItem, ir: RecipeIR) {
    if (item.kind === "decl") {
      ir.decls.push({ property: item.property, value: this.checkDecl(item) });
    } else if (item.kind === "use") {
      this.usedRecipes.add(item.recipe);
      const inlined = this.resolveRecipe(item.recipe, item.recipeSpan);
      if (inlined) {
        ir.decls.push(...inlined.decls);
        ir.states.push(...inlined.states);
      }
    } else {
      // Slot blocks inside states are rejected by the parser outside
      // component bodies, so recipes/styles never carry them here.
      ir.states.push({
        selectors: item.selectors,
        decls: item.items.map((d) => ({ property: d.property, value: this.checkDecl(d) })),
      });
    }
  }

  /**
   * Validates a declaration: resolves token refs, then warns on unknown
   * property names (ARV180) and grammar-mismatched values (ARV181).
   * Returns the resolved value text.
   */
  private checkDecl(decl: Declaration): string {
    const before = this.diagnostics.length;
    const resolved = this.resolveValue(decl.value);
    const css = this.options.css ?? "syntax";
    if (css === false) return resolved;

    // Custom properties take any name and any value.
    if (decl.property.startsWith("--")) return resolved;

    if (!isKnownProperty(decl.property)) {
      const hint = didYouMean(decl.property, knownPropertyNames());
      this.report(
        "ARV180",
        `unknown CSS property '${decl.property}'`,
        decl.propertySpan,
        hint ? `did you mean '${hint}'?` : undefined,
        "warning",
        hint ? replaceFix(decl.propertySpan, hint) : undefined,
      );
      return resolved;
    }

    if (css !== "syntax") return resolved;
    // Unresolved refs already produced an error; don't cascade.
    if (this.diagnostics.length > before) return resolved;
    // A ref that did not resolve (unknown group, or no theme env at all)
    // passes through as literal `group.name` text — never judge it as CSS.
    const hasUnresolvedRef = decl.value.words.some((w) => {
      if (w.kind !== "ref") return false;
      if (this.localTokens?.[w.group]?.[w.name] !== undefined) return false;
      if (w.group === "keyframes") return this.env.keyframes[w.name] === undefined;
      return this.env.tokens[w.group]?.[w.name] === undefined;
    });
    if (hasUnresolvedRef) return resolved;
    // css-tree cannot match trees containing var()/env() — this also skips
    // every moded-theme value, where refs become var(--arvia-…).
    if (resolved.includes("var(") || resolved.includes("env(")) return resolved;

    const text = resolved.replace(/\s*!important\s*$/i, "");
    const mismatch = matchValueSyntax(decl.property, text);
    if (mismatch) {
      this.report(
        "ARV181",
        `value does not match the syntax of '${decl.property}'`,
        decl.value.span,
        mismatch,
        "warning",
      );
    }
    return resolved;
  }

  // --- values ----------------------------------------------------------------

  /**
   * Resolves token aliases inside theme values (`b = color.a;`) against
   * tokens declared earlier in the file or the shared env. Always inlines
   * literals (theme values are the source CSS-var definitions, never `var()`).
   * `keyframes.*` refs stay literal — keyframes are collected after the theme.
   */
  private resolveThemeValue(value: RawValue, mode: string | null, modes: string[] | null): string {
    if (!value.words.some((w) => w.kind === "ref" && w.group !== "keyframes")) {
      return value.text;
    }
    const onUnknown = (word: RefWord) => {
      if (word.group === "keyframes") return;
      const bucket = this.env.tokens[word.group];
      const hint = bucket ? didYouMean(word.name, Object.keys(bucket)) : undefined;
      this.report(
        "ARV101",
        `unknown token '${word.group}.${word.name}'`,
        word.span,
        hint
          ? `did you mean '${word.group}.${hint}'?`
          : "theme values may only reference tokens declared earlier",
        "error",
        hint ? replaceFix(word.span, `${word.group}.${hint}`) : undefined,
      );
    };
    if (mode !== null) {
      return substituteRefsForMode(value, this.env.tokens, mode, modes, onUnknown);
    }
    return substituteRefs(
      value,
      { tokens: this.env.tokens, modes: null, keyframes: {} },
      onUnknown,
    );
  }

  /** Validates token refs in a value and returns the text with refs inlined. */
  resolveValue(value: RawValue): string {
    if (this.localTokens) {
      for (const word of value.words) {
        if (word.kind === "ref" && this.localTokens[word.group]?.[word.name] !== undefined) {
          this.usedLocalTokens.add(`${word.group}.${word.name}`);
        }
      }
    }
    return substituteRefs(
      value,
      this.env,
      (word) => {
        if (word.group === "keyframes") {
          const hint = didYouMean(word.name, Object.keys(this.env.keyframes));
          this.report(
            "ARV151",
            `unknown keyframes '${word.name}'`,
            word.span,
            hint ? `did you mean 'keyframes.${hint}'?` : undefined,
            "error",
            hint ? replaceFix(word.span, `keyframes.${hint}`) : undefined,
          );
          return;
        }
        const bucket = this.env.tokens[word.group];
        const hint = bucket ? didYouMean(word.name, Object.keys(bucket)) : undefined;
        this.report(
          "ARV101",
          `unknown token '${word.group}.${word.name}'`,
          word.span,
          hint ? `did you mean '${word.group}.${hint}'?` : undefined,
          "error",
          hint ? replaceFix(word.span, `${word.group}.${hint}`) : undefined,
        );
      },
      this.localTokens,
    );
  }

  // --- globals -----------------------------------------------------------------

  private checkGlobals() {
    for (const item of this.ast.items) {
      if (item.kind !== "global") continue;
      for (const rule of item.rules) {
        for (const decl of rule.decls) this.checkDecl(decl);
      }
    }
  }

  // --- components ----------------------------------------------------------------

  private checkComponents() {
    const names = new Set<string>();
    for (const item of this.ast.items) {
      if (item.kind !== "component") continue;
      if (names.has(item.name)) {
        this.report("ARV110", `duplicate component '${item.name}'`, item.nameSpan);
        continue;
      }
      names.add(item.name);
      if (!JS_IDENT_RE.test(item.name) || RESERVED.has(item.name)) {
        this.report(
          "ARV116",
          `component name '${item.name}' is not a valid JavaScript identifier`,
          item.nameSpan,
          "component names become exported functions; use letters, digits, '_' or '$'",
        );
      }
      if (item.name === "tokens" && this.fileExportsTokens()) {
        this.report(
          "ARV125",
          "component 'tokens' conflicts with the theme's generated `tokens` export",
          item.nameSpan,
          "theme-bearing files export their tokens as `tokens`; pick another name",
        );
      }
      this.checkComponent(item);
    }
  }

  private checkComponent(component: ComponentDecl) {
    // Pass 1: collect slots, variants and local tokens (sections may appear in any order).
    const slotNames = new Set<string>(["root"]);
    const variants = new Map<string, { span: Span; values: Map<string, Span> }>();
    const sectionCounts = new Map<string, Span[]>();
    const localTokens: LocalTokens = {};
    let hasLocalTokens = false;
    const localTokenSpans = new Map<string, Span>();

    for (const item of component.items) {
      if (
        item.kind === "base" ||
        item.kind === "slots" ||
        item.kind === "variants" ||
        item.kind === "defaults" ||
        item.kind === "responsive" ||
        item.kind === "container" ||
        item.kind === "tokens"
      ) {
        const spans = sectionCounts.get(item.kind) ?? [];
        spans.push(item.span);
        sectionCounts.set(item.kind, spans);
      }
      if (item.kind === "tokens") {
        for (const group of item.groups) {
          const bucket = (localTokens[group.name] ??= {});
          for (const entry of group.entries) {
            if (bucket[entry.name] !== undefined) {
              this.report(
                "ARV118",
                `duplicate local token '${group.name}.${entry.name}' in component '${component.name}'`,
                entry.nameSpan,
              );
              continue;
            }
            bucket[entry.name] = entry.value.text;
            hasLocalTokens = true;
            localTokenSpans.set(`${group.name}.${entry.name}`, entry.nameSpan);
          }
          for (const override of group.overrides) {
            this.report(
              "ARV119",
              "component tokens do not support mode overrides",
              override.modeSpan,
              "moded values belong in the theme — component tokens are compile-time constants",
            );
          }
        }
      }
      if (item.kind === "slots") {
        for (const slot of item.slots) {
          if (slot.name !== "root" && slotNames.has(slot.name)) {
            this.report("ARV113", `duplicate slot '${slot.name}'`, slot.nameSpan);
          } else if (
            slot.name === "root" &&
            item.slots.filter((s) => s.name === "root").length > 1
          ) {
            this.report("ARV113", `duplicate slot 'root'`, slot.nameSpan);
          }
          slotNames.add(slot.name);
        }
      }
      if (item.kind === "variants") {
        for (const variant of item.variants) {
          if (variants.has(variant.name)) {
            this.report("ARV114", `duplicate variant '${variant.name}'`, variant.nameSpan);
            continue;
          }
          if (variant.values.length === 0) {
            this.report(
              "ARV173",
              `variant '${variant.name}' has no values`,
              variant.nameSpan,
              "its generated prop type is `never`, making the component uninstantiable",
              "warning",
            );
          }
          const values = new Map<string, Span>();
          for (const value of variant.values) {
            if (values.has(value.name)) {
              this.report(
                "ARV114",
                `duplicate value '${value.name}' in variant '${variant.name}'`,
                value.nameSpan,
              );
              continue;
            }
            values.set(value.name, value.nameSpan);
          }
          variants.set(variant.name, { span: variant.nameSpan, values });
        }
      }
    }

    for (const [section, spans] of sectionCounts) {
      for (const span of spans.slice(1)) {
        this.report(
          "ARV115",
          `duplicate '${section}' block in component '${component.name}'`,
          span,
        );
      }
    }

    const checkSlotName = (name: string, span: Span) => {
      if (!slotNames.has(name)) {
        const hint = didYouMean(name, slotNames);
        this.report(
          "ARV120",
          `unknown slot '${name}' in component '${component.name}'`,
          span,
          hint ? `did you mean '${hint}'?` : "declare it in the 'slots { }' block",
          "error",
          hint ? replaceFix(span, hint) : undefined,
        );
      }
    };

    const checkBody = (body: StyleBody) => {
      for (const item of body.items) {
        if (item.kind === "slotblock") {
          checkSlotName(item.name, item.nameSpan);
          for (const inner of item.items) this.checkStyleItem(inner);
        } else {
          if (item.kind === "state") {
            // Cross-slot targets ("group hover") must name declared slots.
            for (const slot of item.slots) {
              checkSlotName(slot.name, slot.nameSpan);
              for (const decl of slot.items) {
                if (decl.kind === "decl") this.checkDecl(decl);
              }
            }
          }
          this.checkStyleItem(item);
        }
      }
    };

    // Pass 2: validate everything, with component tokens shadowing the theme.
    this.localTokens = hasLocalTokens ? localTokens : null;
    this.usedLocalTokens.clear();
    for (const item of component.items) {
      switch (item.kind) {
        case "decl":
          this.checkDecl(item);
          break;
        case "use":
          this.usedRecipes.add(item.recipe);
          this.resolveRecipe(item.recipe, item.recipeSpan);
          break;
        case "base":
          checkBody(item.body);
          break;
        case "slots":
          for (const slot of item.slots) {
            for (const inner of slot.items) this.checkStyleItem(inner);
          }
          break;
        case "variants":
          for (const variant of item.variants) {
            for (const value of variant.values) checkBody(value.body);
          }
          break;
        case "defaults": {
          const seen = new Set<string>();
          for (const entry of item.entries) {
            if (seen.has(entry.variant)) {
              this.report(
                "ARV124",
                `duplicate default for variant '${entry.variant}'`,
                entry.variantSpan,
              );
              continue;
            }
            seen.add(entry.variant);
            const variant = variants.get(entry.variant);
            if (!variant) {
              const hint = didYouMean(entry.variant, variants.keys());
              this.report(
                "ARV124",
                `defaults references unknown variant '${entry.variant}'`,
                entry.variantSpan,
                hint ? `did you mean '${hint}'?` : undefined,
                "error",
                hint ? replaceFix(entry.variantSpan, hint) : undefined,
              );
            } else if (!variant.values.has(entry.value)) {
              const hint = didYouMean(entry.value, variant.values.keys());
              this.report(
                "ARV124",
                `defaults references unknown value '${entry.value}' for variant '${entry.variant}'`,
                entry.valueSpan,
                hint ? `did you mean '${hint}'?` : undefined,
                "error",
                hint ? replaceFix(entry.valueSpan, hint) : undefined,
              );
            }
          }
          break;
        }
        case "responsive": {
          const seenBreakpoints = new Set<string>();
          for (const entry of item.entries) {
            if (seenBreakpoints.has(entry.breakpoint)) {
              this.report(
                "ARV140",
                `duplicate responsive breakpoint '${entry.breakpoint}'`,
                entry.breakpointSpan,
              );
              continue;
            }
            seenBreakpoints.add(entry.breakpoint);
            if (!this.env.breakpoints[entry.breakpoint]) {
              const hint = didYouMean(entry.breakpoint, Object.keys(this.env.breakpoints));
              this.report(
                "ARV141",
                `unknown breakpoint '${entry.breakpoint}'`,
                entry.breakpointSpan,
                hint
                  ? `did you mean '${hint}'?`
                  : "declare breakpoints in theme { breakpoint { ... } }",
                "error",
                hint ? replaceFix(entry.breakpointSpan, hint) : undefined,
              );
            }
            const seenVariants = new Set<string>();
            for (const variant of entry.variants) {
              if (seenVariants.has(variant.variant)) {
                this.report(
                  "ARV142",
                  `duplicate responsive override for variant '${variant.variant}' at breakpoint '${entry.breakpoint}'`,
                  variant.variantSpan,
                );
                continue;
              }
              seenVariants.add(variant.variant);
              const variantDecl = variants.get(variant.variant);
              if (!variantDecl) {
                const hint = didYouMean(variant.variant, variants.keys());
                this.report(
                  "ARV143",
                  `responsive references unknown variant '${variant.variant}'`,
                  variant.variantSpan,
                  hint ? `did you mean '${hint}'?` : undefined,
                  "error",
                  hint ? replaceFix(variant.variantSpan, hint) : undefined,
                );
              } else if (!variantDecl.values.has(variant.value)) {
                const hint = didYouMean(variant.value, variantDecl.values.keys());
                this.report(
                  "ARV144",
                  `responsive references unknown value '${variant.value}' for variant '${variant.variant}'`,
                  variant.valueSpan,
                  hint ? `did you mean '${hint}'?` : undefined,
                  "error",
                  hint ? replaceFix(variant.valueSpan, hint) : undefined,
                );
              }
            }
          }
          break;
        }
        case "container": {
          const seenContainers = new Set<string>();
          for (const entry of item.entries) {
            if (seenContainers.has(entry.container)) {
              this.report(
                "ARV160",
                `duplicate container query '${entry.container}'`,
                entry.containerSpan,
              );
              continue;
            }
            seenContainers.add(entry.container);
            if (!this.env.containers[entry.container]) {
              const hint = didYouMean(entry.container, Object.keys(this.env.containers));
              this.report(
                "ARV161",
                `unknown container size '${entry.container}'`,
                entry.containerSpan,
                hint ? `did you mean '${hint}'?` : "declare sizes in theme { container { ... } }",
                "error",
                hint ? replaceFix(entry.containerSpan, hint) : undefined,
              );
            }
            const seenVariants = new Set<string>();
            for (const variant of entry.variants) {
              if (seenVariants.has(variant.variant)) {
                this.report(
                  "ARV162",
                  `duplicate container override for variant '${variant.variant}' at '${entry.container}'`,
                  variant.variantSpan,
                );
                continue;
              }
              seenVariants.add(variant.variant);
              const variantDecl = variants.get(variant.variant);
              if (!variantDecl) {
                const hint = didYouMean(variant.variant, variants.keys());
                this.report(
                  "ARV163",
                  `container references unknown variant '${variant.variant}'`,
                  variant.variantSpan,
                  hint ? `did you mean '${hint}'?` : undefined,
                  "error",
                  hint ? replaceFix(variant.variantSpan, hint) : undefined,
                );
              } else if (!variantDecl.values.has(variant.value)) {
                const hint = didYouMean(variant.value, variantDecl.values.keys());
                this.report(
                  "ARV164",
                  `container references unknown value '${variant.value}' for variant '${variant.variant}'`,
                  variant.valueSpan,
                  hint ? `did you mean '${hint}'?` : undefined,
                  "error",
                  hint ? replaceFix(variant.valueSpan, hint) : undefined,
                );
              }
            }
          }
          break;
        }
        case "compound": {
          if (item.matchers.length === 0) {
            this.report(
              "ARV123",
              "compound block has no variant matchers",
              item.span,
              "add matchers like 'size: sm;' so the styles apply conditionally",
              "warning",
            );
          }
          const seen = new Set<string>();
          for (const matcher of item.matchers) {
            if (seen.has(matcher.variant)) {
              this.report(
                "ARV126",
                `duplicate matcher for variant '${matcher.variant}' in compound block`,
                matcher.variantSpan,
              );
              continue;
            }
            seen.add(matcher.variant);
            const variant = variants.get(matcher.variant);
            if (!variant) {
              const hint = didYouMean(matcher.variant, variants.keys());
              this.report(
                "ARV121",
                `compound matcher references unknown variant '${matcher.variant}'`,
                matcher.variantSpan,
                hint
                  ? `did you mean '${hint}'?`
                  : "styles inside compound blocks must live in slot blocks like 'root { ... }'",
                "error",
                hint ? replaceFix(matcher.variantSpan, hint) : undefined,
              );
            } else if (!variant.values.has(matcher.value)) {
              const hint = didYouMean(matcher.value, variant.values.keys());
              this.report(
                "ARV122",
                `compound matcher references unknown value '${matcher.value}' for variant '${matcher.variant}'`,
                matcher.valueSpan,
                hint ? `did you mean '${hint}'?` : undefined,
                "error",
                hint ? replaceFix(matcher.valueSpan, hint) : undefined,
              );
            }
          }
          if (item.slots.length === 0) {
            this.report(
              "ARV123",
              "compound block has no styles",
              item.span,
              "add a slot block like 'root { ... }' with the styles to apply",
              "warning",
            );
          }
          for (const slot of item.slots) {
            checkSlotName(slot.name, slot.nameSpan);
            for (const inner of slot.items) this.checkStyleItem(inner);
          }
          break;
        }
      }
    }

    // Unused *slots* are deliberately not a compiler warning: an unstyled
    // slot consumed only as a TSX className hook is a legitimate pattern the
    // compiler cannot see. The language server surfaces those as hints.
    for (const [key, span] of localTokenSpans) {
      if (this.usedLocalTokens.has(key)) continue;
      this.report(
        "ARV171",
        `component token '${key}' is never used in '${component.name}'`,
        span,
        undefined,
        "warning",
      );
    }
    this.localTokens = null;
  }

  private checkStyleItem(item: StyleItem) {
    if (item.kind === "decl") {
      this.checkDecl(item);
    } else if (item.kind === "use") {
      this.usedRecipes.add(item.recipe);
      this.resolveRecipe(item.recipe, item.recipeSpan);
    } else {
      for (const decl of item.items) this.checkDecl(decl);
    }
  }
}
