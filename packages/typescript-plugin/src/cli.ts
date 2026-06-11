#!/usr/bin/env node
import { runTsc } from "@volar/typescript/lib/quickstart/runTsc";
import { createArviaLanguagePlugin } from "./languagePlugin";

/**
 * arvia-tsc: drop-in replacement for `tsc` that resolves `.arv` imports
 * through the Arvia language plugin (the vue-tsc pattern). All tsc flags work:
 * `arvia-tsc --noEmit`, `arvia-tsc -p tsconfig.json`, `--watch`, …
 */
const tscPath = require.resolve("typescript/lib/tsc");

runTsc(tscPath, [".arv"], (ts) => ({
  languagePlugins: [createArviaLanguagePlugin(ts)],
}));
