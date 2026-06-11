#!/usr/bin/env node
/**
 * Merges newly collected source_strings.json entries into locale translation files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const locales = ["fr_FR", "es_ES", "de_DE", "pt_PT"];

const source = JSON.parse(fs.readFileSync(path.join(root, "source_strings.json"), "utf8"));

for (const locale of locales) {
  const file = path.join(root, "translations", `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  let added = 0;

  for (const phrase of Object.values(source.phrases)) {
    const hash = Object.keys(phrase.hashToLeaf ?? {})[0];
    if (!hash || data.translations[hash]) continue;

    const leaf = phrase.hashToLeaf[hash];
    const text = leaf?.text ?? phrase.jsfbt?.t?.text ?? "";
    const description = leaf?.desc ?? phrase.jsfbt?.t?.desc ?? "";

    data.translations[hash] = {
      description,
      status: "new",
      tokens: phrase.jsfbt?.m ?? [],
      translations: [{ translation: text, variations: {} }],
      types: phrase.jsfbt?.t?.types ?? [],
    };
    added++;
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`${locale}: added ${added} entries (${Object.keys(data.translations).length} total)`);
}
