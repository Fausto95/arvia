/**
 * CSS property/value validation backed by css-tree's mdn-data grammar.
 * Everything here is best-effort: css-tree's data set can lag the platform,
 * so callers emit warnings only and the wrapper fails open on internal
 * errors.
 */
import { lexer } from "css-tree";

// @types/css-tree omits the lexer's data dictionaries.
const lexerData = lexer as unknown as { properties?: Record<string, unknown> };
const properties = new Set<string>(Object.keys(lexerData.properties ?? {}));
let propertyNames: string[] | null = null;

export function isKnownProperty(name: string): boolean {
  return properties.has(name.toLowerCase());
}

export function knownPropertyNames(): readonly string[] {
  return (propertyNames ??= [...properties]);
}

/**
 * Matches a resolved declaration value against the property's grammar.
 * Returns a short mismatch description, or null when the value matches or
 * cannot be judged (unknown property, css-tree internal error).
 */
export function matchValueSyntax(property: string, value: string): string | null {
  if (!isKnownProperty(property)) return null;
  try {
    const result = lexer.matchProperty(property.toLowerCase(), value);
    if (!result.error) return null;
    const raw =
      (result.error as { rawMessage?: string }).rawMessage ?? result.error.message ?? "mismatch";
    // First line only — css-tree appends a multi-line caret display.
    return raw.split("\n")[0]!;
  } catch {
    return null;
  }
}
