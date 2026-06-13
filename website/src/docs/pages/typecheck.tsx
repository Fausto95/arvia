import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const typecheckMeta: DocPageMeta = {
  slug: "typecheck",
  title: <fbt desc="Docs page title — Type checking">{"Type checking"}</fbt>,
  description: (
    <fbt desc="Docs page description — Typecheck .arv imports.">
      {"Two ways to typecheck .arv imports: plain tsc, or virtual types."}
    </fbt>
  ),
  nav: { section: "tooling", order: 1 },
  searchText:
    'By default the Vite plugin writes .d.ts files into a generated .arvia/types directory, so you typecheck .arv imports with plain tsc — no extra checker. Add a rootDirs overlay to your tsconfig so tsc resolves the imports: { "compilerOptions": { "moduleResolution": "bundler", "rootDirs": ["src", ".arvia/types"] } }. The plugin writes the files whenever Vite runs; for a standalone tsc (CI or a fresh clone) generate them first with arvia gen src — a pretypecheck script runs it before typecheck. .arvia is generated; the plugin drops a self-ignoring .gitignore. Resolution requires moduleResolution bundler (Vite default) or node10 — not node16/nodenext. Alternative: set dts: false and use @arviahq/typescript-plugin, which serves virtual types inside tsserver; typecheck with arvia-tsc. Vue projects use the Vue-aware arvia-tsc because plain tsc can not check .vue files. Related: Vite plugin, CLI.',
};

export function TypecheckPage() {
  return (
    <DocArticle meta={typecheckMeta}>
      <DocP>
        <fbt desc="Docs content — typecheck: intro">
          {
            "Arvia gives you two ways to typecheck `.arv` imports. The default needs no special checker — just `tsc`."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: plain tsc">{"Plain tsc (default)"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — typecheck: central">
          {
            "By default the Vite plugin writes `.d.ts` files into a generated `.arvia/types` directory. Add a `rootDirs` overlay so `tsc` resolves `.arv` imports against them:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"tsconfig.json"}
        code={`{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "rootDirs": ["src", ".arvia/types"]
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — typecheck: generate">
          {
            "The plugin writes these files whenever Vite runs. For a standalone `tsc` — CI, or a fresh clone before the dev server has run — generate them first with the `arvia` CLI. A `pretypecheck` script runs automatically before `typecheck`:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"package.json"}
        code={`{
  "scripts": {
    "pretypecheck": "arvia gen src",
    "typecheck": "tsc --noEmit"
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — typecheck: gitignore and resolution">
          {
            '`.arvia/` is generated — the plugin drops a self-ignoring `.gitignore` inside it. Resolution relies on `moduleResolution: "bundler"` (Vite\'s default) or `node10` — not `node16`/`nodenext`.'
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: virtual types">{"Virtual types (no files)"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — typecheck: dts false">
          {
            "Prefer nothing on disk? Set `dts: false` in the plugin options and add `@arviahq/typescript-plugin`, which serves `.arv` types virtually inside tsserver. Typecheck with `arvia-tsc`, a thin `tsc` wrapper that loads the plugin:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"tsconfig.json"}
        code={`{
  "compilerOptions": {
    "plugins": [{ "name": "@arviahq/typescript-plugin" }]
  }
}`}
      />
      <DocCode
        label={"package.json"}
        code={`{ "scripts": { "typecheck": "arvia-tsc --noEmit" } }`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — typecheck: vue">
          {
            "Vue projects use this mode: plain `tsc` can't typecheck `.vue` single-file components, so use the Vue-aware `arvia-tsc` in place of `vue-tsc`."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — typecheck: related">
          {
            "Related: [Vite plugin](/docs/vite-plugin) · [CLI](/docs/cli) · [Frameworks](/docs/react)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
