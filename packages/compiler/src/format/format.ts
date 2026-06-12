/**
 * Canonical .arv formatter.
 *
 * Token-stream based, NOT an AST reprint: the parser discards comments, so
 * formatting works on a lossless statement scan of the source instead.
 *
 * Safety (enforced in code, not just tests):
 * - sources with parse errors are returned unchanged
 * - the formatted output must contain exactly the same significant atoms
 *   (non-whitespace text, strings and comments verbatim) as the input,
 *   otherwise the original source is returned (fail closed)
 * - whitespace runs are only ever collapsed to one space, never removed,
 *   so selector/value semantics cannot change
 */
import { parse } from "../parser/parser.js";

export interface FormatOptions {
  /** Indentation unit. Default: two spaces. */
  indent?: string;
  /** Single-line blocks longer than this break into lines. Default: 100. */
  printWidth?: number;
}

type Node =
  | { kind: "comment"; text: string; blankBefore: boolean }
  | { kind: "stmt"; text: string; blankBefore: boolean; trailing: string | null }
  | {
      kind: "block";
      head: string;
      body: Node[];
      multiline: boolean;
      blankBefore: boolean;
      trailing: string | null;
    };

export function formatArv(source: string, options?: FormatOptions): string {
  if (parse(source, "format.arv").diagnostics.length > 0) return source;

  let tree: Node[];
  try {
    tree = new Scanner(source).scanBlock(true);
  } catch {
    return source;
  }

  const printer = new Printer(options?.indent ?? "  ", options?.printWidth ?? 100);
  const formatted = printer.print(tree);

  // Fail closed: identical significant atoms or no change at all.
  if (atoms(formatted) !== atoms(source)) return source;
  return formatted;
}

// --- scanning ----------------------------------------------------------------

class Scanner {
  private pos = 0;

  constructor(private readonly src: string) {}

  /** Scans statements/blocks until `}` (or EOF when `top`). */
  scanBlock(top: boolean): Node[] {
    const nodes: Node[] = [];
    for (;;) {
      const blankBefore = this.skipWs() >= 2 && nodes.length > 0;
      const c = this.src[this.pos];
      if (c === undefined) {
        if (!top) throw new Error("unbalanced braces");
        return nodes;
      }
      if (c === "}") {
        if (top) throw new Error("unbalanced braces");
        this.pos++;
        return nodes;
      }
      if (this.atComment()) {
        nodes.push({ kind: "comment", text: this.readComment(), blankBefore });
        continue;
      }

      const run = this.readRun();
      if (run.terminator === "{") {
        this.pos++; // consume '{'
        const startLine = this.lineAt(this.pos);
        const body = this.scanBlock(false);
        const multiline = this.lineAt(this.pos) !== startLine;
        nodes.push({
          kind: "block",
          head: run.text,
          body,
          multiline,
          blankBefore,
          trailing: this.readTrailing(),
        });
      } else if (run.terminator === ";") {
        this.pos++; // consume ';'
        nodes.push({ kind: "stmt", text: run.text, blankBefore, trailing: this.readTrailing() });
      } else {
        // '}' or EOF terminates an unfinished statement — parse-clean sources
        // never get here with content.
        if (run.text.length > 0) throw new Error("statement without terminator");
      }
    }
  }

  /** Raw text until an unnested `;`, `{` or `}` — string/paren aware,
   *  comments verbatim, whitespace collapsed outside strings. */
  private readRun(): { text: string; terminator: string | null } {
    let out = "";
    let depth = 0;
    let pendingWs = false;
    const push = (chunk: string) => {
      if (pendingWs && out.length > 0) out += " ";
      pendingWs = false;
      out += chunk;
    };
    while (this.pos < this.src.length) {
      const c = this.src[this.pos]!;
      if (depth === 0 && (c === ";" || c === "}" || c === "{")) {
        return { text: out, terminator: c };
      }
      if (c === " " || c === "\t" || c === "\r" || c === "\n") {
        pendingWs = true;
        this.pos++;
        continue;
      }
      if (c === '"' || c === "'") {
        push(this.readString());
        continue;
      }
      if (this.atComment()) {
        push(this.readComment());
        continue;
      }
      if (c === "(") depth++;
      if (c === ")" && depth > 0) depth--;
      push(c);
      this.pos++;
    }
    return { text: out, terminator: null };
  }

  /** A line comment on the same line as the statement that just ended. */
  private readTrailing(): string | null {
    let i = this.pos;
    while (this.src[i] === " " || this.src[i] === "\t") i++;
    if (this.src[i] === "/" && this.src[i + 1] === "/") {
      this.pos = i;
      return this.readComment();
    }
    return null;
  }

  private readString(): string {
    const quote = this.src[this.pos]!;
    let out = quote;
    this.pos++;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos]!;
      out += c;
      this.pos++;
      if (c === "\\") {
        if (this.pos < this.src.length) {
          out += this.src[this.pos]!;
          this.pos++;
        }
        continue;
      }
      if (c === quote) break;
    }
    return out;
  }

  private atComment(): boolean {
    return (
      this.src[this.pos] === "/" &&
      (this.src[this.pos + 1] === "/" || this.src[this.pos + 1] === "*")
    );
  }

  private readComment(): string {
    const start = this.pos;
    if (this.src[this.pos + 1] === "/") {
      while (this.pos < this.src.length && this.src[this.pos] !== "\n") this.pos++;
      return this.src.slice(start, this.pos).trimEnd();
    }
    this.pos += 2;
    while (
      this.pos < this.src.length &&
      !(this.src[this.pos] === "*" && this.src[this.pos + 1] === "/")
    ) {
      this.pos++;
    }
    this.pos = Math.min(this.pos + 2, this.src.length);
    return this.src.slice(start, this.pos);
  }

  /** Skips whitespace; returns the number of newlines crossed. */
  private skipWs(): number {
    let newlines = 0;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos]!;
      if (c === "\n") newlines++;
      else if (c !== " " && c !== "\t" && c !== "\r") break;
      this.pos++;
    }
    return newlines;
  }

  private lineAt(pos: number): number {
    let line = 0;
    for (let i = 0; i < pos && i < this.src.length; i++) {
      if (this.src[i] === "\n") line++;
    }
    return line;
  }
}

// --- printing ----------------------------------------------------------------

class Printer {
  constructor(
    private readonly indentUnit: string,
    private readonly printWidth: number,
  ) {}

  print(nodes: Node[]): string {
    const lines: string[] = [];
    this.printNodes(nodes, 0, lines, true);
    return (
      lines
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim() + "\n"
    );
  }

  private printNodes(nodes: Node[], depth: number, lines: string[], top: boolean): void {
    const indent = this.indentUnit.repeat(depth);
    nodes.forEach((node, i) => {
      if (i > 0 && (node.blankBefore || top)) lines.push("");
      switch (node.kind) {
        case "comment":
          lines.push(indent + node.text);
          break;
        case "stmt":
          lines.push(indent + normalizeStatement(node.text) + ";" + trailing(node.trailing));
          break;
        case "block": {
          const inline = this.inline(node, indent.length);
          if (inline !== null) {
            lines.push(indent + inline + trailing(node.trailing));
            break;
          }
          lines.push(indent + node.head + " {");
          this.printNodes(node.body, depth + 1, lines, false);
          lines.push(indent + "}" + trailing(node.trailing));
          break;
        }
      }
    });
  }

  /** Single-line rendering when the source kept the block on one line and
   *  the normalized result fits; null forces the multiline form. */
  private inline(node: Extract<Node, { kind: "block" }>, startCol: number): string | null {
    if (node.multiline) return null;
    const parts: string[] = [];
    for (const child of node.body) {
      if (child.kind === "comment" || child.trailing) return null;
      if (child.kind === "stmt") {
        parts.push(normalizeStatement(child.text) + ";");
      } else {
        const nested = this.inline(child, 0);
        if (nested === null) return null;
        parts.push(nested);
      }
    }
    const text = parts.length === 0 ? `${node.head} {}` : `${node.head} { ${parts.join(" ")} }`;
    return startCol + text.length <= this.printWidth ? text : null;
  }
}

function trailing(comment: string | null): string {
  return comment ? ` ${comment}` : "";
}

/** `name: value` / `name = value` spacing; ` | ` around top-level pipes. */
function normalizeStatement(text: string): string {
  const colon = topLevelIndex(text, ":");
  const equals = topLevelIndex(text, "=");
  if (equals !== -1 && (colon === -1 || equals < colon)) {
    return `${text.slice(0, equals).trim()} = ${spacePipes(text.slice(equals + 1).trim())}`;
  }
  if (colon !== -1 && !text.startsWith("&")) {
    return `${text.slice(0, colon).trim()}: ${spacePipes(text.slice(colon + 1).trim())}`;
  }
  return text;
}

function topLevelIndex(text: string, needle: string): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0 && c === needle) return i;
  }
  return -1;
}

function spacePipes(value: string): string {
  let out = "";
  let quote: string | null = null;
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value[i]!;
    if (quote) {
      out += c;
      if (c === "\\" && i + 1 < value.length) out += value[++i]!;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    if (c === "(") depth++;
    if (c === ")") depth = Math.max(0, depth - 1);
    if (c === "|" && depth === 0) {
      out = out.trimEnd() + " | ";
      while (value[i + 1] === " ") i++;
      continue;
    }
    out += c;
  }
  return out;
}

/** Significant content fingerprint: everything except whitespace layout. */
function atoms(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const c = source[i]!;
    if (c === " " || c === "\t" || c === "\r" || c === "\n") {
      // A whitespace boundary is significant between word characters
      // (collapse-only guarantee) — represent any run as one marker.
      if (out.length > 0 && out[out.length - 1] !== " ") out += " ";
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      out += c;
      i++;
      while (i < source.length) {
        const s = source[i]!;
        out += s;
        i++;
        if (s === "\\" && i < source.length) {
          out += source[i]!;
          i++;
          continue;
        }
        if (s === quote) break;
      }
      continue;
    }
    out += c;
    i++;
  }
  // Whitespace adjacent to punctuation is layout, not semantics.
  return out
    .replace(/ ?([{}();:=,|&]) ?/g, "$1")
    .replace(/ +$/g, "")
    .replace(/^ +/g, "");
}
