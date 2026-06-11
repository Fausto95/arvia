#!/usr/bin/env node
/**
 * Applies human translations to fbtee translation JSON files by English source text.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const localeTranslations = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/locale-translations.json"), "utf8"),
);

for (const [locale, map] of Object.entries(localeTranslations)) {
  const file = path.join(root, "translations", `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  let updated = 0;

  for (const entry of Object.values(data.translations)) {
    const english = entry.translations[0].translation;
    if (map[english]) {
      entry.translations[0].translation = map[english];
      entry.status = "translated";
      updated++;
    }
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`${locale}: updated ${updated} entries`);
}
