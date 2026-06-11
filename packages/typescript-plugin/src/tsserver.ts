import { createLanguageServicePlugin } from "@volar/typescript/lib/quickstart/createLanguageServicePlugin";
import { createArviaLanguagePlugin } from "./languagePlugin";

/**
 * tsserver plugin entry — the package main, so a tsconfig entry of
 * `"plugins": [{ "name": "@arviahq/typescript-plugin" }]` (or the VS Code
 * extension's typescriptServerPlugins contribution) loads it directly.
 */
module.exports = createLanguageServicePlugin((ts) => ({
  languagePlugins: [createArviaLanguagePlugin(ts)],
}));
