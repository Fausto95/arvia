import { parse } from "./parser/parser.js";
import { check } from "./checker/checker.js";
import { buildIR } from "./ir/build.js";
import { emitCss } from "./generators/css/emit.js";
import { emitJs } from "./generators/js/emit.js";
import { emitDts, emitDtsWithAnchors, type DtsAnchor } from "./generators/dts/emit.js";
import { emptyEnv, type ThemeEnv } from "./ir/ir.js";
import type { Diagnostic } from "./diagnostics.js";
import type { ArviaFile } from "./ast/nodes.js";

export type { Diagnostic, DiagnosticFix, Severity, Span } from "./diagnostics.js";
export { ArviaError, renderDiagnostic } from "./diagnostics.js";
export type { ThemeEnv, RecipeIR, StyleIR, DeclIR, StateIR, TokenModes } from "./ir/ir.js";
export { emptyEnv } from "./ir/ir.js";
export type { DtsAnchor } from "./generators/dts/emit.js";

// Editor tooling surface: the recovered AST, position utilities and a
// codegen-free analysis entry point (used by @arviahq/language-server).
export { parse, type ParseResult } from "./parser/parser.js";
export type * from "./ast/nodes.js";
export { LineIndex, type Position, type SpanRange } from "./position.js";
export { formatArv, type FormatOptions } from "./format/format.js";

export interface AnalyzeResult {
  /** Recovered AST — present even when diagnostics contain errors. */
  ast: ArviaFile;
  diagnostics: Diagnostic[];
  /** Merged environment (only meaningful when the file parsed cleanly). */
  env: ThemeEnv;
}

/**
 * Parse + check without code generation — the fast path for editor
 * diagnostics. Returns the recovered AST even for files mid-edit; checker
 * diagnostics are only collected when the file parses cleanly (matching
 * `compile()` semantics, avoiding cascades from a partial AST).
 */
export function analyze(
  source: string,
  options: {
    filename: string;
    env?: ThemeEnv;
    css?: false | "names" | "syntax";
    sharedEnvFile?: boolean;
  },
): AnalyzeResult {
  const { ast, diagnostics: parseDiagnostics } = parse(source, options.filename);
  if (parseDiagnostics.length > 0) {
    return { ast, diagnostics: parseDiagnostics, env: options.env ?? emptyEnv() };
  }
  const { diagnostics, env } = check(ast, {
    filename: options.filename,
    env: options.env,
    css: options.css,
    sharedEnvFile: options.sharedEnvFile,
  });
  return { ast, diagnostics, env };
}

export interface CompileOptions {
  /** Absolute (or project-relative) path of the source, used for diagnostics
   *  and stable class-name hashing. */
  filename: string;
  /** Project root: class hashes are derived from the path relative to it so
   *  they are identical across machines. */
  root?: string;
  /** Shared environment (tokens + recipes), typically from the theme file. */
  env?: ThemeEnv;
  /** CSS validation level (warnings): property names + value syntax
   *  (default), names only, or off. */
  css?: false | "names" | "syntax";
  /** True when compiling the conventional shared theme file — suppresses
   *  unused-in-file warnings for recipes other files consume. */
  sharedEnvFile?: boolean;
}

export interface CompileResult {
  /** Generated artifacts — null when `diagnostics` contains errors. */
  css: string | null;
  js: string | null;
  dts: string | null;
  diagnostics: Diagnostic[];
  /** Merged environment exported by this file (its own theme/recipes win). */
  env: ThemeEnv;
  meta: {
    components: {
      name: string;
      hash: string;
      slots: string[];
      variants: { name: string; values: string[] }[];
      defaults: Record<string, string>;
      responsive: { breakpoint: string; variants: Record<string, string> }[];
      containers: { container: string; variants: Record<string, string> }[];
    }[];
    tokens: {
      group: string;
      name: string;
      doc: string | null;
      byMode: Record<string, string>;
      cssVar: string;
    }[];
    keyframes: string[];
    /** Standalone exported style classes. */
    styles: { name: string; hash: string; className: string }[];
  };
}

export interface CompileDtsResult {
  /** Generated declarations — null only when the source fails to parse. */
  dts: string | null;
  anchors: DtsAnchor[];
}

/**
 * Fast, environment-free declaration generation for TypeScript tooling.
 *
 * Types depend only on component/slot/variant names — never on token values
 * or recipes — so this skips the checker entirely: a misspelled token still
 * yields correct types (the error surfaces through the Vite plugin instead).
 */
export function compileDts(
  source: string,
  options: { filename: string; env?: ThemeEnv },
): CompileDtsResult {
  // The parser recovers past errors, so types survive for every component it
  // managed to parse — a syntax typo in one component doesn't nuke the file.
  const { ast } = parse(source, options.filename);
  // Theme files need a checked env: buildIR materializes themeVars (the
  // `tokens` export) only for token groups present in the env, and the theme
  // file itself is compiled without one. Component-only files keep the fast
  // checker-free path.
  let env = options.env ?? emptyEnv();
  if (ast.items.some((item) => item.kind === "theme")) {
    env = check(ast, { filename: options.filename, env: options.env }).env;
  }
  const ir = buildIR(ast, env, { filename: options.filename });
  const { code, anchors } = emitDtsWithAnchors(ir);
  return { dts: code, anchors };
}

export function compile(source: string, options: CompileOptions): CompileResult {
  const { ast, diagnostics: parseDiagnostics } = parse(source, options.filename);

  // Parse errors: report all of them at once, but don't run the checker on a
  // partial AST — dropped constructs would produce misleading cascades.
  if (parseDiagnostics.length > 0) {
    return {
      css: null,
      js: null,
      dts: null,
      diagnostics: parseDiagnostics,
      env: options.env ?? emptyEnv(),
      meta: { components: [], tokens: [], keyframes: [], styles: [] },
    };
  }

  const { diagnostics, env } = check(ast, {
    filename: options.filename,
    env: options.env,
    css: options.css,
    sharedEnvFile: options.sharedEnvFile,
  });

  if (diagnostics.some((d) => d.severity === "error")) {
    return {
      css: null,
      js: null,
      dts: null,
      diagnostics,
      env,
      meta: { components: [], tokens: [], keyframes: [], styles: [] },
    };
  }

  const ir = buildIR(ast, env, { filename: options.filename, root: options.root });

  return {
    css: emitCss(ir),
    js: emitJs(ir),
    dts: emitDts(ir),
    diagnostics,
    env,
    meta: {
      components: ir.components.map((c) => ({
        name: c.name,
        hash: c.hash,
        slots: c.slotNames,
        variants: c.variants.map((v) => ({
          name: v.name,
          values: v.values.map((val) => val.name),
        })),
        defaults: c.defaults,
        responsive: c.responsive,
        containers: c.containers,
      })),
      tokens: ir.themeVars.map((v) => ({
        group: v.group,
        name: v.name,
        doc: v.doc,
        byMode: v.byMode,
        cssVar: `--arvia-${v.group}-${v.name}`,
      })),
      keyframes: ir.keyframes.map((k) => k.name),
      styles: ir.styles.map((s) => ({ name: s.name, hash: s.hash, className: s.className })),
    },
  };
}
