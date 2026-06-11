import type { ColorInformation, ColorPresentation, Color } from "vscode-languageserver";
import type { DocumentAnalysis } from "./documents.js";
import { rangeOf } from "./hover.js";
import { walkValues } from "./walk.js";

const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FN_RE = /^(rgba?|hsla?)\(([^)]*)\)$/;

const to255 = (v: number) => Math.round(v * 255);
const rgbChannel = (raw: string) =>
  raw.endsWith("%") ? parseFloat(raw) / 100 : parseFloat(raw) / 255;

/** Inline color swatches for literal color values (hex / rgb / hsl). */
export function getDocumentColors(analysis: DocumentAnalysis): ColorInformation[] {
  const out: ColorInformation[] = [];
  for (const { value } of walkValues(analysis.ast)) {
    for (const word of value.words) {
      if (word.kind !== "literal") continue;
      const color = parseColor(word.text);
      if (color) out.push({ range: rangeOf(analysis, word.span), color });
    }
  }
  return out;
}

export function getColorPresentations(
  color: Color,
  span: { start: number; end: number },
): ColorPresentation[] {
  void span;
  const hex2 = (v: number) => to255(v).toString(16).padStart(2, "0");
  const hex =
    color.alpha < 1
      ? `#${hex2(color.red)}${hex2(color.green)}${hex2(color.blue)}${hex2(color.alpha)}`
      : `#${hex2(color.red)}${hex2(color.green)}${hex2(color.blue)}`;
  const rgb =
    color.alpha < 1
      ? `rgba(${to255(color.red)}, ${to255(color.green)}, ${to255(color.blue)}, ${Math.round(color.alpha * 100) / 100})`
      : `rgb(${to255(color.red)}, ${to255(color.green)}, ${to255(color.blue)})`;
  return [{ label: hex }, { label: rgb }];
}

export function parseColor(text: string): Color | null {
  if (HEX_RE.test(text)) return parseHex(text);
  const fn = FN_RE.exec(text);
  if (fn) {
    const args = fn[2]!
      .split(/[,\s/]+/)
      .map((a) => a.trim())
      .filter(Boolean);
    if (args.length < 3) return null;
    if (fn[1]!.startsWith("rgb")) return parseRgbArgs(args);
    return parseHslArgs(args);
  }
  return null;
}

function parseHex(text: string): Color {
  const hex = text.slice(1);
  const wide = hex.length >= 6;
  const step = wide ? 2 : 1;
  const channel = (i: number) => {
    const part = hex.slice(i * step, i * step + step);
    const value = parseInt(wide ? part : part + part, 16);
    return value / 255;
  };
  const hasAlpha = hex.length === 4 || hex.length === 8;
  return {
    red: channel(0),
    green: channel(1),
    blue: channel(2),
    alpha: hasAlpha ? channel(3) : 1,
  };
}

function parseRgbArgs(args: string[]): Color | null {
  const [r, g, b] = [rgbChannel(args[0]!), rgbChannel(args[1]!), rgbChannel(args[2]!)];
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  const alpha = args[3] !== undefined ? parseAlpha(args[3]) : 1;
  return { red: clamp01(r), green: clamp01(g), blue: clamp01(b), alpha };
}

function parseHslArgs(args: string[]): Color | null {
  const h = parseFloat(args[0]!);
  const s = parseFloat(args[1]!) / 100;
  const l = parseFloat(args[2]!) / 100;
  if ([h, s, l].some((v) => Number.isNaN(v))) return null;
  const alpha = args[3] !== undefined ? parseAlpha(args[3]) : 1;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = l - c / 2;
  return { red: clamp01(r1 + m), green: clamp01(g1 + m), blue: clamp01(b1 + m), alpha };
}

function parseAlpha(raw: string): number {
  return clamp01(raw.endsWith("%") ? parseFloat(raw) / 100 : parseFloat(raw));
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
