import { hashClass } from "./hash.js";
import type { ComponentIR } from "./ir.js";

// Minified names hash a structural descriptor scoped by the component's
// identity hash. The `bp:`/`cq:`/`c:` markers keep the descriptor spaces
// disjoint, so a plain variant can never alias a responsive/container/compound
// class — inputs are injective and only hash truncation could collide.

export function baseClass(c: ComponentIR, slot: string): string {
  if (c.minify) return hashClass(c.hash, slot);
  return `${c.name}_${slot}_${c.hash}`;
}

export function variantClass(c: ComponentIR, variant: string, value: string, slot: string): string {
  if (c.minify) return hashClass(c.hash, `${variant}:${value}:${slot}`);
  return `${c.name}_${variant}_${value}_${slot}_${c.hash}`;
}

export function compoundClass(c: ComponentIR, match: [string, string][], slot: string): string {
  if (c.minify) {
    const path = match.map(([v, val]) => `${v}:${val}`).join(":");
    return hashClass(c.hash, `c:${path}:${slot}`);
  }
  const path = match.map(([v, val]) => `${v}_${val}`).join("_");
  return `${c.name}_${path}_${slot}_${c.hash}`;
}

export function responsiveVariantClass(
  c: ComponentIR,
  variant: string,
  value: string,
  breakpoint: string,
  slot: string,
): string {
  if (c.minify) return hashClass(c.hash, `${variant}:${value}:bp:${breakpoint}:${slot}`);
  return `${c.name}_${variant}_${value}_bp_${breakpoint}_${slot}_${c.hash}`;
}

export function containerVariantClass(
  c: ComponentIR,
  variant: string,
  value: string,
  container: string,
  slot: string,
): string {
  if (c.minify) return hashClass(c.hash, `${variant}:${value}:cq:${container}:${slot}`);
  return `${c.name}_${variant}_${value}_cq_${container}_${slot}_${c.hash}`;
}
