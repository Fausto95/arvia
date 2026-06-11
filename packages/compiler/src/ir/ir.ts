/** Normalized, fully-resolved representation consumed by the generators.
 *  By IR time: token refs are inlined values, recipes are flattened,
 *  the implicit `root` slot is materialized. */

import type { Span } from "../diagnostics.js";

export interface DeclIR {
  property: string;
  value: string;
}

export interface StateIR {
  /** Selector suffixes appended to the owning class, e.g. [":hover", ":focus"].
   *  A leading space marks a descendant part (`" .child"`). */
  selectors: string[];
  decls: DeclIR[];
  /** Cross-slot declarations ("group hover"): targetSlot → decls, emitted as
   *  `.owner<suffix> .targetSlotBaseClass`. Component contexts only. */
  slotDecls?: Record<string, DeclIR[]>;
}

export interface StyleIR {
  decls: DeclIR[];
  states: StateIR[];
}

export type RecipeIR = StyleIR;

/** Per-token values keyed by theme mode name. */
export type TokenModes = Record<string, string>;

/** Tokens + resolved recipes shared across files (the conventional theme file). */
export interface ThemeEnv {
  /** null = single-mode (inline token values); non-null = CSS custom properties. */
  modes: string[] | null;
  /** Breakpoint tokens from `breakpoint {}` — consumed by responsive variants. */
  breakpoints: Record<string, string>;
  /** Container size tokens from `container {}` — consumed by container queries. */
  containers: Record<string, string>;
  tokens: Record<string, Record<string, string | TokenModes>>;
  /** Prose documentation keyed by token group and name. */
  tokenDocs: Record<string, Record<string, string>>;
  recipes: Record<string, RecipeIR>;
  /** Keyframe animation names defined in the theme file. */
  keyframes: Record<string, string>;
}

export function emptyEnv(): ThemeEnv {
  return {
    modes: null,
    breakpoints: {},
    containers: {},
    tokens: {},
    tokenDocs: {},
    recipes: {},
    keyframes: {},
  };
}

export function cssVarName(group: string, name: string): string {
  return `--arvia-${group}-${name}`;
}

export interface ThemeVarIR {
  group: string;
  name: string;
  doc: string | null;
  /** Resolved CSS values per mode (refs already substituted). */
  byMode: Record<string, string>;
}

export interface KeyframesIR {
  name: string;
  /** Hashed CSS animation name emitted in @keyframes. */
  cssName: string;
  steps: { selector: string; decls: DeclIR[] }[];
}

export function emptyStyle(): StyleIR {
  return { decls: [], states: [] };
}

export function isEmptyStyle(s: StyleIR): boolean {
  return s.decls.length === 0 && s.states.length === 0;
}

export interface VariantValueIR {
  name: string;
  /** Only slots actually styled by this value appear here. */
  slots: Record<string, StyleIR>;
}

export interface VariantIR {
  name: string;
  values: VariantValueIR[];
}

export interface CompoundIR {
  /** [variant, value] pairs in variant-declaration order. */
  match: [string, string][];
  slots: Record<string, StyleIR>;
}

export interface ResponsiveIR {
  breakpoint: string;
  variants: Record<string, string>;
}

export interface ContainerIR {
  container: string;
  variants: Record<string, string>;
}

export interface ComponentIR {
  name: string;
  /** Span of the component name in the .arv source (for editor navigation). */
  nameSpan: Span;
  hash: string;
  /** `root` first, then declared slots in source order. */
  slotNames: string[];
  base: Record<string, StyleIR>;
  variants: VariantIR[];
  compounds: CompoundIR[];
  defaults: Record<string, string>;
  responsive: ResponsiveIR[];
  containers: ContainerIR[];
}

/** Standalone exported class from a top-level `style` declaration. */
export interface StyleDeclIR {
  name: string;
  /** Span of the style name in the .arv source (for editor navigation). */
  nameSpan: Span;
  hash: string;
  className: string;
  style: StyleIR;
}

export interface GlobalRuleIR {
  selector: string;
  decls: DeclIR[];
}

export interface FileIR {
  globals: GlobalRuleIR[];
  components: ComponentIR[];
  /** Exported single-class styles, emitted after components (utilities-last). */
  styles: StyleDeclIR[];
  /** CSS custom property definitions when the source file declares theme modes. */
  themeVars: ThemeVarIR[];
  themeModes: string[] | null;
  breakpoints: Record<string, string>;
  containerSizes: Record<string, string>;
  keyframes: KeyframesIR[];
}
