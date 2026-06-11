import type * as ts from "typescript";
import type { CodeMapping, LanguagePlugin, VirtualCode } from "@volar/language-core";
// Side-effect type import: augments LanguagePlugin with the `typescript` option.
import type {} from "@volar/typescript";
import { compileDts } from "@arviahq/compiler";
import { themeEnvFor } from "./resolveTheme.js";

/**
 * Volar language plugin: presents each `.arv` file to TypeScript as a
 * virtual module whose content is the generated declarations. Nothing is
 * written to disk — `import { Button } from './button.arv'` typechecks
 * directly against the in-memory `.d.ts` text.
 *
 * Types depend only on component/slot/variant names, so this needs no theme
 * environment and no semantic checking (see `compileDts`).
 */
export function createArviaLanguagePlugin(typescript: typeof ts): LanguagePlugin<string> {
  return {
    getLanguageId(scriptId) {
      if (scriptId.endsWith(".arv")) return "arvia";
      return undefined;
    },

    createVirtualCode(scriptId, languageId, snapshot) {
      if (languageId !== "arvia") return undefined;
      return createArviaVirtualCode(scriptId, snapshot);
    },

    typescript: {
      extraFileExtensions: [
        {
          extension: "arv",
          isMixedContent: false,
          scriptKind: typescript.ScriptKind.Deferred,
        },
      ],
      getServiceScript(rootCode) {
        return {
          code: rootCode,
          extension: ".ts",
          scriptKind: typescript.ScriptKind.TS,
        };
      },
    },
  };
}

export function createArviaVirtualCode(
  scriptId: string,
  snapshot: ts.IScriptSnapshot,
): VirtualCode {
  const source = snapshot.getText(0, snapshot.getLength());
  const { dts, anchors } = compileDts(source, {
    filename: scriptId,
    env: themeEnvFor(scriptId),
  });
  // On parse errors, fall back to an empty module so one syntax typo doesn't
  // cascade "cannot find module" errors through every importer. The real
  // diagnostic surfaces through the Vite plugin / arvia CLI.
  const text = dts ?? "export {};\n";

  // Map each generated component identifier back to `component <Name>` in the
  // .arv source, so go-to-definition and find-references cross the virtual
  // file boundary.
  const mappings: CodeMapping[] = anchors.map((anchor) => ({
    sourceOffsets: [anchor.sourceStart],
    generatedOffsets: [anchor.generatedStart],
    lengths: [anchor.sourceLength],
    data: {
      verification: true,
      completion: true,
      semantic: true,
      navigation: true,
      structure: true,
      format: false,
    },
  }));

  return {
    id: "main",
    languageId: "typescript",
    snapshot: {
      getText: (start, end) => text.slice(start, end),
      getLength: () => text.length,
      getChangeRange: () => undefined,
    },
    mappings,
  };
}
