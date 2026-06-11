import { getDefaultCSSDataProvider } from "vscode-css-languageservice";
import type { IPropertyData } from "vscode-css-languageservice";

let propertyIndex: Map<string, IPropertyData> | null = null;

/** MDN-sourced CSS property data (the dataset behind VS Code's CSS hover). */
export function cssProperty(name: string): IPropertyData | undefined {
  if (!propertyIndex) {
    propertyIndex = new Map();
    for (const property of getDefaultCSSDataProvider().provideProperties()) {
      propertyIndex.set(property.name, property);
    }
  }
  return propertyIndex.get(name);
}

export function allCssProperties(): IPropertyData[] {
  cssProperty("color"); // ensure index
  return [...propertyIndex!.values()];
}

export function propertyDescription(property: IPropertyData): string {
  const desc = property.description;
  if (!desc) return "";
  return typeof desc === "string" ? desc : desc.value;
}

/** Markdown hover card for a CSS property (or custom property). */
export function cssPropertyHover(name: string): string | null {
  if (name.startsWith("--")) {
    return `**${name}** — CSS custom property`;
  }
  const property = cssProperty(name);
  if (!property) return null;
  const parts = [`**${name}**`];
  const description = propertyDescription(property);
  if (description) parts.push(description);
  if (property.syntax) parts.push(`\`\`\`\n${property.syntax}\n\`\`\``);
  const mdn = property.references?.find((r) => r.name.includes("MDN"));
  if (mdn) parts.push(`[MDN Reference](${mdn.url})`);
  return parts.join("\n\n");
}
