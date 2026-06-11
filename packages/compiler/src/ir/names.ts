import type { ComponentIR } from "./ir.js";

export function baseClass(c: ComponentIR, slot: string): string {
  return `${c.name}_${slot}_${c.hash}`;
}

export function variantClass(c: ComponentIR, variant: string, value: string, slot: string): string {
  return `${c.name}_${variant}_${value}_${slot}_${c.hash}`;
}

export function compoundClass(c: ComponentIR, match: [string, string][], slot: string): string {
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
  return `${c.name}_${variant}_${value}_bp_${breakpoint}_${slot}_${c.hash}`;
}

export function containerVariantClass(
  c: ComponentIR,
  variant: string,
  value: string,
  container: string,
  slot: string,
): string {
  return `${c.name}_${variant}_${value}_cq_${container}_${slot}_${c.hash}`;
}
