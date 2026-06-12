import { ArviaError, makeDiagnostic, type Diagnostic, type Span } from "../diagnostics.js";
import { Lexer } from "../lexer/lexer.js";
import type { Token, TokenKind } from "../lexer/tokens.js";
import type {
  ComponentDecl,
  ComponentItem,
  CompoundBlock,
  Declaration,
  DefaultEntry,
  ResponsiveBlock,
  ResponsiveEntry,
  ContainerBlock,
  ContainerEntry,
  KeyframesDecl,
  KeyframeStep,
  GlobalBlock,
  GlobalRule,
  ArviaFile,
  RawValue,
  RecipeDecl,
  SlotBlock,
  SlotDecl,
  StateBlock,
  StyleBody,
  StyleDecl,
  StyleItem,
  ThemeBlock,
  TokenEntry,
  ModeOverrideBlock,
  TokenGroup,
  TopLevelItem,
  ValueWord,
  VariantDecl,
  VariantValue,
} from "../ast/nodes.js";

const SECTION_KEYWORDS = new Set([
  "base",
  "slots",
  "variants",
  "defaults",
  "responsive",
  "container",
  "compound",
  "tokens",
]);
const TOP_KEYWORDS = new Set(["theme", "global", "recipe", "keyframes", "style", "component"]);
const MAX_ERRORS = 100;

export interface ParseResult {
  /** Always present — recovered constructs survive even when errors exist. */
  ast: ArviaFile;
  diagnostics: Diagnostic[];
}

export function parse(source: string, file: string): ParseResult {
  return new Parser(source, file).parseFile();
}

/** Control-flow sentinel: unwinds to the nearest recovery loop after an
 *  error has been recorded. Never escapes the parser. */
class SyncRequest extends Error {}

class Parser {
  private lx: Lexer;
  private file: string;
  private diagnostics: Diagnostic[] = [];

  constructor(source: string, file: string) {
    this.lx = new Lexer(source, file);
    this.file = file;
  }

  private fail(message: string, span: Span, hint?: string): never {
    if (this.diagnostics.length < MAX_ERRORS) {
      this.diagnostics.push(makeDiagnostic("ARV010", "error", message, this.file, span, hint));
    }
    throw new SyncRequest();
  }

  /**
   * Panic-mode recovery: runs one production; on failure records the error
   * (lexer errors included), runs `sync` to a safe resume point and returns
   * undefined so the enclosing loop can continue.
   */
  private recoverable<T>(production: () => T, sync: () => void): T | undefined {
    try {
      return production();
    } catch (error) {
      if (error instanceof SyncRequest) {
        sync();
        return undefined;
      }
      if (error instanceof ArviaError) {
        if (this.diagnostics.length < MAX_ERRORS) this.diagnostics.push(error.diagnostic);
        sync();
        return undefined;
      }
      throw error;
    }
  }

  /** Skips to just past the next `;` or just past a balanced `{ … }` block
   *  (whichever ends first), or to (not past) the `}` closing the current
   *  block — the CSS error-recovery convention. */
  private syncItem(): void {
    let depth = 0;
    for (;;) {
      const c = this.lx.peekChar();
      if (c === null) return;
      if (c === "{") {
        depth++;
        this.lx.skipChar();
        continue;
      }
      if (c === "}") {
        if (depth === 0) return;
        depth--;
        this.lx.skipChar();
        // A whole bad block was skipped: resume right after it so the next
        // valid item isn't swallowed while hunting for a ';'.
        if (depth === 0) return;
        continue;
      }
      if (c === ";" && depth === 0) {
        this.lx.skipChar();
        return;
      }
      this.lx.skipChar();
    }
  }

  /** Skips to the next top-level keyword at brace depth zero. */
  private syncTopLevel(): void {
    let depth = 0;
    for (;;) {
      const c = this.lx.peekChar();
      if (c === null) return;
      if (c === "{") {
        depth++;
        this.lx.skipChar();
        continue;
      }
      if (c === "}") {
        if (depth > 0) depth--;
        this.lx.skipChar();
        continue;
      }
      if (depth === 0 && /[A-Za-z_]/.test(c)) {
        const mark = this.lx.mark();
        let tok: Token | undefined;
        try {
          tok = this.lx.next();
        } catch {
          this.lx.skipChar();
          continue;
        }
        if (tok.kind === "ident" && TOP_KEYWORDS.has(tok.text)) {
          this.lx.reset(mark);
          return;
        }
        continue;
      }
      this.lx.skipChar();
    }
  }

  /** True at the end of the enclosing block ('}' next) or at EOF. */
  private atBlockEnd(): boolean {
    const c = this.lx.peekChar();
    return c === "}" || c === null;
  }

  private describe(tok: Token): string {
    return tok.kind === "eof" ? "end of file" : JSON.stringify(tok.text);
  }

  /** Expect helpers reset to before the offending token, so recovery can
   *  re-examine it (e.g. a top-level keyword starting the next construct). */
  private expect(kind: TokenKind, what: string): Token {
    const mark = this.lx.mark();
    const tok = this.lx.next();
    if (tok.kind !== kind) {
      this.lx.reset(mark);
      this.fail(`expected ${what} but found ${this.describe(tok)}`, tok.span);
    }
    return tok;
  }

  private expectIdent(what: string): Token {
    const mark = this.lx.mark();
    const tok = this.lx.next();
    if (tok.kind !== "ident") {
      this.lx.reset(mark);
      this.fail(`expected ${what} but found ${this.describe(tok)}`, tok.span);
    }
    return tok;
  }

  /** ident or number — used for theme token names and variant value names. */
  private expectName(what: string): Token {
    const mark = this.lx.mark();
    const tok = this.lx.next();
    if (tok.kind !== "ident" && tok.kind !== "number") {
      this.lx.reset(mark);
      this.fail(`expected ${what} but found ${this.describe(tok)}`, tok.span);
    }
    return tok;
  }

  // --- file ----------------------------------------------------------------

  parseFile(): ParseResult {
    const items: ArviaFile["items"] = [];
    while (this.lx.peekChar() !== null) {
      const item = this.recoverable(
        () => this.parseTopLevel(),
        () => this.syncTopLevel(),
      );
      if (item) items.push(item);
    }
    return { ast: { items }, diagnostics: this.diagnostics };
  }

  private parseTopLevel(): TopLevelItem {
    const head = this.lx.next();
    if (head.kind === "ident") {
      switch (head.text) {
        case "theme":
          return this.parseTheme(head.span);
        case "global":
          return this.parseGlobal(head.span);
        case "recipe":
          return this.parseRecipe(head.span);
        case "keyframes":
          return this.parseKeyframes(head.span);
        case "style":
          return this.parseStyleDecl(head.span);
        case "component":
          return this.parseComponent(head.span);
      }
    }
    this.fail(
      `expected 'theme', 'global', 'recipe', 'keyframes', 'style' or 'component' but found ${this.describe(head)}`,
      head.span,
    );
  }

  // --- theme ---------------------------------------------------------------

  private parseTheme(start: Span): ThemeBlock {
    this.expect("lbrace", "'{' after 'theme'");
    let modes: string[] | null = null;
    let modesSpan: Span | null = null;
    const groups: TokenGroup[] = [];
    while (!this.atBlockEnd()) {
      const mark = this.lx.mark();
      const head = this.lx.next();
      if (head.kind === "ident" && head.text === "modes") {
        this.lx.reset(mark);
        const parsed = this.recoverable(
          () => this.parseModesDeclaration(),
          () => this.syncItem(),
        );
        if (parsed) {
          modes = parsed.modes;
          modesSpan = parsed.span;
        }
        continue;
      }
      this.lx.reset(mark);
      const group = this.recoverable(
        () => this.parseTokenGroup(),
        () => this.syncItem(),
      );
      if (group) groups.push(group);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      kind: "theme",
      modes,
      modesSpan,
      groups,
      span: { ...start, end: close.span.end },
    };
  }

  private parseModesDeclaration(): { modes: string[]; span: Span } {
    const start = this.expectIdent("'modes'").span;
    this.expect("colon", "':' after 'modes'");
    const modes: string[] = [];
    const first = this.expectIdent("a theme mode name");
    modes.push(first.text);
    while (this.lx.peekChar() === "|") {
      this.expect("pipe", "'|'");
      modes.push(this.expectIdent("a theme mode name").text);
    }
    const end = this.expect("semicolon", "';' after theme modes").span.end;
    return { modes, span: { ...start, end } };
  }

  private parseTokenGroup(): TokenGroup {
    const name = this.expectIdent("a token group name");
    this.expect("lbrace", `'{' after token group '${name.text}'`);
    const entries: TokenEntry[] = [];
    const overrides: ModeOverrideBlock[] = [];
    while (!this.atBlockEnd()) {
      const mark = this.lx.mark();
      const head = this.lx.next();
      if (head.kind === "at") {
        this.lx.reset(mark);
        const block = this.recoverable(
          () => this.parseModeOverrideBlock(),
          () => this.syncItem(),
        );
        if (block) overrides.push(block);
        continue;
      }
      this.lx.reset(mark);
      const entry = this.recoverable(
        () => this.parseTokenEntry(),
        () => this.syncItem(),
      );
      if (entry) entries.push(entry);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      name: name.text,
      nameSpan: name.span,
      entries,
      overrides,
      span: { ...name.span, end: close.span.end },
    };
  }

  private parseModeOverrideBlock(): ModeOverrideBlock {
    const at = this.expect("at", "'@'");
    const mode = this.expectIdent("a theme mode name after '@'");
    this.expect("lbrace", `'{' after '@${mode.text}'`);
    const entries: TokenEntry[] = [];
    while (!this.atBlockEnd()) {
      const entry = this.recoverable(
        () => this.parseTokenEntry(),
        () => this.syncItem(),
      );
      if (entry) entries.push(entry);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      mode: mode.text,
      modeSpan: mode.span,
      entries,
      span: { ...at.span, end: close.span.end },
    };
  }

  private parseTokenEntry(): TokenEntry {
    const entryName = this.expectName("a token name");
    this.expect("equals", `'=' after token '${entryName.text}'`);
    const value = this.parseRawValue({ stopBeforeDoc: true });
    let doc: string | null = null;
    const mark = this.lx.mark();
    const maybeDoc = this.lx.next();
    if (maybeDoc.kind === "ident" && maybeDoc.text === "doc") {
      const docTok = this.lx.rawValue();
      if (docTok.text.startsWith('"') || docTok.text.startsWith("'")) {
        doc = docTok.text.slice(1, -1);
      } else {
        this.fail("expected a quoted string after 'doc'", docTok.span);
      }
    } else {
      this.lx.reset(mark);
    }
    const semi = this.expect("semicolon", "';' after token value");
    return {
      name: entryName.text,
      nameSpan: entryName.span,
      value,
      doc,
      span: { ...entryName.span, end: semi.span.end },
    };
  }

  // --- global --------------------------------------------------------------

  private parseGlobal(start: Span): GlobalBlock {
    this.expect("lbrace", "'{' after 'global'");
    const rules: GlobalRule[] = [];
    while (!this.atBlockEnd()) {
      const rule = this.recoverable(
        () => this.parseGlobalRule(),
        () => this.syncItem(),
      );
      if (rule) rules.push(rule);
    }
    const close = this.expect("rbrace", "'}'");
    return { kind: "global", rules, span: { ...start, end: close.span.end } };
  }

  private parseGlobalRule(): GlobalRule {
    const selector = this.lx.rawSelector();
    this.expect("lbrace", "'{' after selector");
    const decls: Declaration[] = [];
    while (!this.atBlockEnd()) {
      const decl = this.recoverable(
        () => this.parseDeclarationFrom(this.expectIdent("a CSS property name")),
        () => this.syncItem(),
      );
      if (decl) decls.push(decl);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      selector: selector.text,
      decls,
      span: { ...selector.span, end: close.span.end },
    };
  }

  // --- recipe --------------------------------------------------------------

  private parseRecipe(start: Span): RecipeDecl {
    const name = this.expectIdent("a recipe name after 'recipe'");
    this.expect("lbrace", `'{' after recipe '${name.text}'`);
    const items = this.parseStyleItems("recipe");
    const close = this.expect("rbrace", "'}'");
    return {
      kind: "recipe",
      name: name.text,
      nameSpan: name.span,
      items,
      span: { ...start, end: close.span.end },
    };
  }

  // --- keyframes -----------------------------------------------------------

  private parseKeyframes(start: Span): KeyframesDecl {
    const name = this.expectIdent("a keyframes name after 'keyframes'");
    this.expect("lbrace", `'{' after keyframes '${name.text}'`);
    const steps: KeyframeStep[] = [];
    while (!this.atBlockEnd()) {
      const step = this.recoverable(
        () => this.parseKeyframeStep(),
        () => this.syncItem(),
      );
      if (step) steps.push(step);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      kind: "keyframes",
      name: name.text,
      nameSpan: name.span,
      steps,
      span: { ...start, end: close.span.end },
    };
  }

  private parseKeyframeStep(): KeyframeStep {
    const selector = this.lx.rawSelector();
    this.expect("lbrace", "'{' after keyframe selector");
    const decls: Declaration[] = [];
    while (!this.atBlockEnd()) {
      const decl = this.recoverable(
        () => this.parseDeclarationFrom(this.expectIdent("a CSS property name")),
        () => this.syncItem(),
      );
      if (decl) decls.push(decl);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      selector: selector.text,
      selectorSpan: selector.span,
      decls,
      span: { ...selector.span, end: close.span.end },
    };
  }

  // --- style ----------------------------------------------------------------

  private parseStyleDecl(start: Span): StyleDecl {
    const name = this.expectIdent("a style name after 'style'");
    this.expect("lbrace", `'{' after style '${name.text}'`);
    const items = this.parseStyleItems("style");
    const close = this.expect("rbrace", "'}'");
    return {
      kind: "styledecl",
      name: name.text,
      nameSpan: name.span,
      items,
      span: { ...start, end: close.span.end },
    };
  }

  // --- component -----------------------------------------------------------

  private parseComponent(start: Span): ComponentDecl {
    const name = this.expectIdent("a component name after 'component'");
    this.expect("lbrace", `'{' after component '${name.text}'`);
    const items: ComponentItem[] = [];
    while (!this.atBlockEnd()) {
      const item = this.recoverable(
        () => this.parseComponentItem(),
        () => this.syncItem(),
      );
      if (item) items.push(item);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      kind: "component",
      name: name.text,
      nameSpan: name.span,
      items,
      span: { ...start, end: close.span.end },
    };
  }

  private parseComponentItem(): ComponentItem {
    const head = this.expectIdent("a section, declaration or 'use'");
    const mark = this.lx.mark();
    const after = this.lx.next();

    // `use Surface;`
    if (head.text === "use" && after.kind === "ident") {
      const semi = this.expect("semicolon", `';' after 'use ${after.text}'`);
      return {
        kind: "use",
        recipe: after.text,
        recipeSpan: after.span,
        span: { ...head.span, end: semi.span.end },
      };
    }

    // Section blocks: base / slots / variants / defaults / compound
    if (after.kind === "lbrace" && SECTION_KEYWORDS.has(head.text)) {
      switch (head.text) {
        case "base": {
          const body = this.parseStyleBody();
          const close = this.expect("rbrace", "'}'");
          return { kind: "base", body, span: { ...head.span, end: close.span.end } };
        }
        case "slots":
          return this.parseSlots(head.span);
        case "variants":
          return this.parseVariants(head.span);
        case "defaults":
          return this.parseDefaults(head.span);
        case "responsive":
          return this.parseResponsive(head.span);
        case "container":
          return this.parseContainer(head.span);
        case "compound":
          return this.parseCompound(head.span);
        case "tokens":
          return this.parseComponentTokens(head.span);
      }
    }

    // Loose declaration at component level (targets the root slot)
    if (after.kind === "colon") {
      return this.parseDeclarationTail(head);
    }

    if (after.kind === "lbrace") {
      this.lx.reset(mark);
      this.fail(
        `unexpected block '${head.text}' inside component`,
        head.span,
        "slot styles belong inside 'base { ... }' (e.g. base { icon { ... } }); top-level component blocks are: base, slots, variants, defaults, responsive, container, compound, tokens",
      );
    }
    this.lx.reset(mark);
    this.fail(`expected ':' or '{' after '${head.text}'`, after.span);
  }

  private parseComponentTokens(start: Span): ComponentItem {
    const groups: TokenGroup[] = [];
    while (!this.atBlockEnd()) {
      const group = this.recoverable(
        () => this.parseTokenGroup(),
        () => this.syncItem(),
      );
      if (group) groups.push(group);
    }
    const close = this.expect("rbrace", "'}'");
    return { kind: "tokens", groups, span: { ...start, end: close.span.end } };
  }

  private parseSlots(start: Span): ComponentItem {
    const slots: SlotDecl[] = [];
    while (!this.atBlockEnd()) {
      const slot = this.recoverable(
        () => this.parseSlotDecl(),
        () => this.syncItem(),
      );
      if (slot) slots.push(slot);
    }
    const close = this.expect("rbrace", "'}'");
    return { kind: "slots", slots, span: { ...start, end: close.span.end } };
  }

  private parseSlotDecl(): SlotDecl {
    const name = this.expectIdent("a slot name");
    this.expect("lbrace", `'{' after slot '${name.text}'`);
    const items = this.parseStyleItems("slot");
    const close = this.expect("rbrace", "'}'");
    return {
      name: name.text,
      nameSpan: name.span,
      items,
      span: { ...name.span, end: close.span.end },
    };
  }

  private parseVariants(start: Span): ComponentItem {
    const variants: VariantDecl[] = [];
    while (!this.atBlockEnd()) {
      const variant = this.recoverable(
        () => this.parseVariantDecl(),
        () => this.syncItem(),
      );
      if (variant) variants.push(variant);
    }
    const close = this.expect("rbrace", "'}'");
    return { kind: "variants", variants, span: { ...start, end: close.span.end } };
  }

  private parseVariantDecl(): VariantDecl {
    const name = this.expectIdent("a variant name");
    this.expect("lbrace", `'{' after variant '${name.text}'`);
    const values: VariantValue[] = [];
    while (!this.atBlockEnd()) {
      const value = this.recoverable(
        () => this.parseVariantValue(),
        () => this.syncItem(),
      );
      if (value) values.push(value);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      name: name.text,
      nameSpan: name.span,
      values,
      span: { ...name.span, end: close.span.end },
    };
  }

  private parseVariantValue(): VariantValue {
    const valueName = this.expectName("a variant value name");
    this.expect("lbrace", `'{' after variant value '${valueName.text}'`);
    const body = this.parseStyleBody();
    const close = this.expect("rbrace", "'}'");
    return {
      name: valueName.text,
      nameSpan: valueName.span,
      body,
      span: { ...valueName.span, end: close.span.end },
    };
  }

  private parseDefaults(start: Span): ComponentItem {
    const entries: DefaultEntry[] = [];
    while (!this.atBlockEnd()) {
      const entry = this.recoverable(
        () => this.parseDefaultEntry(),
        () => this.syncItem(),
      );
      if (entry) entries.push(entry);
    }
    const close = this.expect("rbrace", "'}'");
    return { kind: "defaults", entries, span: { ...start, end: close.span.end } };
  }

  private parseDefaultEntry(): DefaultEntry {
    const variant = this.expectIdent("a variant name");
    this.expect("colon", `':' after '${variant.text}'`);
    const value = this.expectName(`a value for variant '${variant.text}'`);
    const semi = this.expect("semicolon", "';' after default entry");
    return {
      variant: variant.text,
      variantSpan: variant.span,
      value: value.text,
      valueSpan: value.span,
      span: { ...variant.span, end: semi.span.end },
    };
  }

  private parseResponsive(start: Span): ResponsiveBlock {
    const entries: ResponsiveEntry[] = [];
    while (!this.atBlockEnd()) {
      const entry = this.recoverable(
        () => this.parseResponsiveEntry(),
        () => this.syncItem(),
      );
      if (entry) entries.push(entry);
    }
    const close = this.expect("rbrace", "'}'");
    return { kind: "responsive", entries, span: { ...start, end: close.span.end } };
  }

  private parseResponsiveEntry(): ResponsiveEntry {
    const breakpoint = this.expectIdent("a breakpoint name");
    this.expect("lbrace", `'{' after breakpoint '${breakpoint.text}'`);
    const variants: DefaultEntry[] = [];
    while (!this.atBlockEnd()) {
      const entry = this.recoverable(
        () => this.parseDefaultEntry(),
        () => this.syncItem(),
      );
      if (entry) variants.push(entry);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      breakpoint: breakpoint.text,
      breakpointSpan: breakpoint.span,
      variants,
      span: { ...breakpoint.span, end: close.span.end },
    };
  }

  private parseContainer(start: Span): ContainerBlock {
    const entries: ContainerEntry[] = [];
    while (!this.atBlockEnd()) {
      const entry = this.recoverable(
        () => this.parseContainerEntry(),
        () => this.syncItem(),
      );
      if (entry) entries.push(entry);
    }
    const close = this.expect("rbrace", "'}'");
    return { kind: "container", entries, span: { ...start, end: close.span.end } };
  }

  private parseContainerEntry(): ContainerEntry {
    const container = this.expectIdent("a container size name");
    this.expect("lbrace", `'{' after container '${container.text}'`);
    const variants: DefaultEntry[] = [];
    while (!this.atBlockEnd()) {
      const entry = this.recoverable(
        () => this.parseDefaultEntry(),
        () => this.syncItem(),
      );
      if (entry) variants.push(entry);
    }
    const close = this.expect("rbrace", "'}'");
    return {
      container: container.text,
      containerSpan: container.span,
      variants,
      span: { ...container.span, end: close.span.end },
    };
  }

  private parseCompound(start: Span): CompoundBlock {
    const matchers: DefaultEntry[] = [];
    const slots: SlotBlock[] = [];
    while (!this.atBlockEnd()) {
      this.recoverable(
        () => this.parseCompoundItem(matchers, slots),
        () => this.syncItem(),
      );
    }
    const close = this.expect("rbrace", "'}'");
    return { kind: "compound", matchers, slots, span: { ...start, end: close.span.end } };
  }

  private parseCompoundItem(matchers: DefaultEntry[], slots: SlotBlock[]): void {
    const head = this.expectIdent("a variant matcher or slot block");
    const mark = this.lx.mark();
    const after = this.lx.next();
    if (after.kind === "colon") {
      // Matchers are `variant: value;` — never CSS declarations.
      const value = this.expectName(`a variant value after '${head.text}:'`);
      const semi = this.expect("semicolon", "';' after matcher");
      matchers.push({
        variant: head.text,
        variantSpan: head.span,
        value: value.text,
        valueSpan: value.span,
        span: { ...head.span, end: semi.span.end },
      });
    } else if (after.kind === "lbrace") {
      const items = this.parseStyleItems("slot");
      const close = this.expect("rbrace", "'}'");
      slots.push({
        kind: "slotblock",
        name: head.text,
        nameSpan: head.span,
        items,
        span: { ...head.span, end: close.span.end },
      });
    } else {
      this.lx.reset(mark);
      this.fail(
        `expected ':' or '{' after '${head.text}' in compound block`,
        after.span,
        "compound blocks contain variant matchers ('size: sm;') and slot style blocks ('root { ... }')",
      );
    }
  }

  // --- style content ---------------------------------------------------------

  /**
   * Body of `base` and variant value blocks: bare declarations / `use` /
   * state blocks target the root slot; named sub-blocks target slots.
   * Caller consumes the closing '}'.
   */
  private parseStyleBody(): StyleBody {
    const items: StyleBody["items"] = [];
    while (!this.atBlockEnd()) {
      const item = this.recoverable(
        () => this.parseStyleBodyItem(),
        () => this.syncItem(),
      );
      if (item) items.push(item);
    }
    return { items };
  }

  private parseStyleBodyItem(): StyleItem | SlotBlock {
    if (this.lx.peekChar() === "&") {
      return this.parseStateBlock(true);
    }
    const head = this.expectIdent("a declaration, slot block, state or 'use'");
    const mark = this.lx.mark();
    const after = this.lx.next();
    if (head.text === "use" && after.kind === "ident") {
      const semi = this.expect("semicolon", `';' after 'use ${after.text}'`);
      return {
        kind: "use",
        recipe: after.text,
        recipeSpan: after.span,
        span: { ...head.span, end: semi.span.end },
      };
    }
    if (after.kind === "colon") {
      return this.parseDeclarationTail(head);
    }
    if (after.kind === "lbrace") {
      const slotItems = this.parseStyleItems("slot");
      const close = this.expect("rbrace", "'}'");
      return {
        kind: "slotblock",
        name: head.text,
        nameSpan: head.span,
        items: slotItems,
        span: { ...head.span, end: close.span.end },
      };
    }
    this.lx.reset(mark);
    this.fail(`expected ':' or '{' after '${head.text}'`, after.span);
  }

  /**
   * Flat style item list (slot blocks, recipes): declarations, `use` and
   * state blocks — no nested slot blocks. Caller consumes the closing '}'.
   */
  private parseStyleItems(context: "slot" | "recipe" | "style"): StyleItem[] {
    const items: StyleItem[] = [];
    while (!this.atBlockEnd()) {
      const item = this.recoverable(
        () => this.parseStyleItem(context),
        () => this.syncItem(),
      );
      if (item) items.push(item);
    }
    return items;
  }

  private parseStyleItem(context: "slot" | "recipe" | "style"): StyleItem {
    if (this.lx.peekChar() === "&") {
      return this.parseStateBlock(false);
    }
    const head = this.expectIdent("a declaration, state or 'use'");
    const mark = this.lx.mark();
    const after = this.lx.next();
    if (head.text === "use" && after.kind === "ident") {
      const semi = this.expect("semicolon", `';' after 'use ${after.text}'`);
      return {
        kind: "use",
        recipe: after.text,
        recipeSpan: after.span,
        span: { ...head.span, end: semi.span.end },
      };
    }
    if (after.kind === "colon") {
      return this.parseDeclarationTail(head);
    }
    if (after.kind === "lbrace") {
      this.lx.reset(mark);
      this.fail(
        `unexpected block '${head.text}' inside a ${context} block`,
        head.span,
        context === "slot"
          ? "slot blocks cannot be nested; only declarations, 'use' and '&'-states are allowed here"
          : context === "style"
            ? "styles contain declarations, 'use' and '&'-states only — use a component for slots and variants"
            : "recipes contain declarations, 'use' and '&'-states only",
      );
    }
    this.lx.reset(mark);
    this.fail(`expected ':' after '${head.text}'`, after.span);
  }

  private parseStateBlock(allowSlots: boolean): StateBlock {
    const amp = this.expect("amp", "'&'");
    const suffix = this.lx.rawSelector();
    // Whitespace after `&` is significant: `& .child` is a descendant.
    const hadGap = suffix.span.start > amp.span.end;
    const selectors = splitStateSelectors(suffix.text, hadGap);
    if (selectors.some((s) => s.trim().length === 0)) {
      this.fail("empty selector in state list", suffix.span);
    }
    this.expect("lbrace", "'{' after state selector");
    const items: Declaration[] = [];
    const slots: SlotBlock[] = [];
    while (!this.atBlockEnd()) {
      this.recoverable(
        () => this.parseStateItem(items, slots, allowSlots),
        () => this.syncItem(),
      );
    }
    const close = this.expect("rbrace", "'}'");
    return {
      kind: "state",
      selectors,
      items,
      slots,
      span: { ...amp.span, end: close.span.end },
    };
  }

  private parseStateItem(items: Declaration[], slots: SlotBlock[], allowSlots: boolean): void {
    const head = this.expectIdent("a CSS property name");
    const mark = this.lx.mark();
    const after = this.lx.next();
    if (head.text === "use" && after.kind === "ident") {
      this.lx.reset(mark);
      this.fail(
        "'use' is not allowed inside state blocks",
        head.span,
        "inline the recipe's declarations directly",
      );
    }
    if (after.kind === "lbrace") {
      if (!allowSlots) {
        this.lx.reset(mark);
        this.fail(
          `unexpected block '${head.text}' inside a state block`,
          head.span,
          "slot blocks inside states are only allowed in 'base' and variant bodies",
        );
      }
      // Cross-slot styling: `&:hover { icon { … } }`.
      const slotItems: Declaration[] = [];
      while (!this.atBlockEnd()) {
        const decl = this.recoverable(
          () => this.parseDeclarationFrom(this.expectIdent("a CSS property name")),
          () => this.syncItem(),
        );
        if (decl) slotItems.push(decl);
      }
      const close = this.expect("rbrace", "'}'");
      slots.push({
        kind: "slotblock",
        name: head.text,
        nameSpan: head.span,
        items: slotItems,
        span: { ...head.span, end: close.span.end },
      });
      return;
    }
    this.lx.reset(mark);
    items.push(this.parseDeclarationFrom(head));
  }

  // --- declarations & values --------------------------------------------------

  /** Parses `: value ;` after the property ident has been consumed. */
  private parseDeclarationFrom(property: Token): Declaration {
    this.expect("colon", `':' after '${property.text}'`);
    return this.parseDeclarationTail(property);
  }

  /** Parses `value ;` after `property :` has been consumed. */
  private parseDeclarationTail(property: Token): Declaration {
    const value = this.parseRawValue();
    const semi = this.expect("semicolon", `';' after value of '${property.text}'`);
    return {
      kind: "decl",
      property: property.text,
      propertySpan: property.span,
      value,
      span: { ...property.span, end: semi.span.end },
    };
  }

  private parseRawValue(options?: { stopBeforeDoc?: boolean }): RawValue {
    const tok = this.lx.rawValue(options);
    return { text: tok.text, words: splitValueWords(tok.text, tok.span), span: tok.span };
  }
}

/**
 * Splits a state selector into per-`&` suffixes: `":hover, &:focus"` →
 * `[":hover", ":focus"]`. Commas inside brackets/parens/strings are kept.
 * Whitespace after `&` is preserved as a single leading space so descendant
 * (`& .child`) and combinator (`& > svg`) forms emit correctly; `hadLeadingGap`
 * carries that information for the first part (its `&` was already consumed).
 */
export function splitStateSelectors(raw: string, hadLeadingGap: boolean): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    if (quote) {
      current += ch;
      if (ch === "\\" && i + 1 < raw.length) {
        current += raw[++i]!;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);

  return parts.map((part, i) => {
    if (i === 0) {
      const trimmed = part.trim();
      return (hadLeadingGap ? " " : "") + trimmed;
    }
    let p = part.trim();
    if (p.startsWith("&")) {
      const rest = p.slice(1);
      p = rest.startsWith(" ") ? ` ${rest.trim()}` : rest;
    }
    return p;
  });
}

const REF_RE = /^([A-Za-z_][A-Za-z0-9_-]*)\.([A-Za-z0-9_-]+)$/;

/**
 * Splits a raw value into words on whitespace and commas, keeping
 * parenthesized groups and strings intact, and pre-classifies words shaped
 * like `group.name` as candidate token references. Spans are absolute.
 */
export function splitValueWords(text: string, span: Span): ValueWord[] {
  const words: ValueWord[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i]!;
    if (c === " " || c === "\t" || c === "\n" || c === "\r" || c === ",") {
      i++;
      continue;
    }
    const start = i;
    let depth = 0;
    let quote: string | null = null;
    while (i < text.length) {
      const ch = text[i]!;
      if (quote) {
        if (ch === "\\") {
          i += 2;
          continue;
        }
        if (ch === quote) quote = null;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        i++;
        continue;
      }
      if (ch === "(") depth++;
      if (ch === ")" && depth > 0) {
        depth--;
        i++;
        continue;
      }
      if (depth === 0 && (ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === ","))
        break;
      i++;
    }
    const wordText = text.slice(start, i);
    const wordSpan: Span = {
      start: span.start + start,
      end: span.start + i,
      line: span.line,
      col: span.col + start,
    };
    const m = REF_RE.exec(wordText);
    if (m) {
      words.push({ kind: "ref", text: wordText, group: m[1]!, name: m[2]!, span: wordSpan });
    } else {
      words.push({ kind: "literal", text: wordText, span: wordSpan });
      // Parenthesized groups (calc(), clamp(), gradients, …) can carry token
      // refs inside them; record those as additional words so they resolve.
      if (wordText.includes("(")) {
        words.push(...innerRefs(wordText, wordSpan));
      }
    }
  }
  return words;
}

const INNER_REF_RE = /(?<![\w.-])([A-Za-z_][A-Za-z0-9_-]*)\.([A-Za-z0-9_-]+)(?![\w.-])/g;

/** Finds `group.name` refs inside a parenthesized word, skipping quoted regions. */
function innerRefs(wordText: string, wordSpan: Span): ValueWord[] {
  const refs: ValueWord[] = [];
  const quoted = quotedMask(wordText);
  for (const m of wordText.matchAll(INNER_REF_RE)) {
    if (quoted[m.index]) continue;
    refs.push({
      kind: "ref",
      text: m[0],
      group: m[1]!,
      name: m[2]!,
      span: {
        start: wordSpan.start + m.index,
        end: wordSpan.start + m.index + m[0].length,
        line: wordSpan.line,
        col: wordSpan.col + m.index,
      },
    });
  }
  return refs;
}

/** Marks which characters sit inside a quoted string. */
function quotedMask(text: string): boolean[] {
  const mask = Array.from({ length: text.length }, () => false);
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quote) {
      mask[i] = true;
      if (ch === "\\") {
        if (i + 1 < text.length) mask[++i] = true;
        continue;
      }
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      mask[i] = true;
    }
  }
  return mask;
}
