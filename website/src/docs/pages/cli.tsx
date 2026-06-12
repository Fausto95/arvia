import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const cliMeta: DocPageMeta = {
  slug: "cli",
  title: <fbt desc="Docs page title — CLI">{"CLI"}</fbt>,
  description: (
    <fbt desc="Docs page description — Generate types and docs without running Vite.">
      {"arvia gen: type declarations, token catalogs, and Storybook stories."}
    </fbt>
  ),
  nav: { section: "tooling", order: 28 },
  searchText:
    "The arvia CLI ships with every Vite plugin package and has one command, gen, with three `modes:` emit TypeScript declarations (the default), generate a token catalog (--docs), or generate Storybook stories (--storybook). terminal arvia gen [dir] [--theme <path>] [--storybook|--docs] [--out <dir>] [--format md|json] Flag Meaning [dir] Directory to scan for `.arv` files (default: current directory; node_modules is skipped). --theme <path> The shared theme file. Default: the first `theme.arv` found under [dir]. --docs Generate a design-token catalog instead of declarations. --storybook Generate CSF stories instead of declarations. --out <dir> Output directory for --docs (default docs/tokens) and --storybook (default stories). --format md|json Catalog format for --docs (default md). Generating declarations terminal arvia gen src/\n# generated src/theme.arv.d.ts\n# generated src/button.arv.d.ts\n# … Each file compiles against the theme and gets a sibling `.d.ts`. Use this in environments where the TypeScript plugin cannot run — CI without `arvia-tsc`, or non-TS consumers of your design system package. Diagnostics print with file and line; any error makes the command exit non-zero, which doubles as a lint step for `.arv` sources. Token catalogs and stories terminal # Markdown token reference for your design-system wiki\narvia gen --docs --theme src/theme.arv --out docs/tokens\n\n# JSON for custom tooling (Figma sync, swatch pages)\narvia gen --docs --format json --theme src/theme.arv --out docs/tokens\n\n# CSF stories from every component's variants and defaults\narvia gen --storybook --theme src/theme.arv --out stories src/ Catalog generation is covered in Token docs; story generation in Storybook. Both modes load their generator packages (@arviahq/docs, @arviahq/storybook) on demand — install the one you use. For day-to-day type checking prefer `arvia-tsc` (from the TypeScript plugin package) over generated siblings: it type-checks `.arv` imports virtually, leaving your working tree clean.",
};

export function CliPage() {
  return (
    <DocArticle meta={cliMeta}>
      <DocP>
        <fbt desc="Docs content — cli: opening">
          {
            "The arvia CLI ships with every Vite plugin package and has one command, gen, with three `modes:` emit TypeScript declarations (the default), generate a token catalog (--docs), or generate Storybook stories (--storybook)."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"terminal"}
        code={`arvia gen [dir] [--theme <path>] [--storybook|--docs] [--out <dir>] [--format md|json]`}
      />
      <DocTable
        headers={[
          <fbt desc="Docs table header — flag">{"Flag"}</fbt>,
          <fbt desc="Docs table header — flag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "[dir]",
            <fbt desc="Docs table cell — cli dir">
              {
                "Directory to scan for `.arv` files (default: current directory; node_modules is skipped)."
              }
            </fbt>,
          ],
          [
            "--theme <path>",
            <fbt desc="Docs table cell — cli theme">
              {"The shared theme file. Default: the first `theme.arv` found under [dir]."}
            </fbt>,
          ],
          [
            "--docs",
            <fbt desc="Docs table cell — cli docs">
              {"Generate a design-token catalog instead of declarations."}
            </fbt>,
          ],
          [
            "--storybook",
            <fbt desc="Docs table cell — cli storybook">
              {"Generate CSF stories instead of declarations."}
            </fbt>,
          ],
          [
            "--out <dir>",
            <fbt desc="Docs table cell — cli out">
              {
                "Output directory for --docs (default docs/tokens) and --storybook (default stories)."
              }
            </fbt>,
          ],
          [
            "--format md|json",
            <fbt desc="Docs table cell — cli format">
              {"Catalog format for --docs (default md)."}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: cli declarations">{"Generating declarations"}</fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`arvia gen src/
# generated src/theme.arv.d.ts
# generated src/button.arv.d.ts
# …`}
      />
      <DocP>
        <fbt desc="Docs content — cli: declarations semantics">
          {
            "Each file compiles against the theme and gets a sibling `.d.ts`. Use this in environments where the TypeScript plugin cannot run — CI without `arvia-tsc`, or non-TS consumers of your design system package. Diagnostics print with file and line; any error makes the command exit non-zero, which doubles as a lint step for `.arv` sources."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: cli catalogs stories">
          {"Token catalogs and stories"}
        </fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`# Markdown token reference for your design-system wiki
arvia gen --docs --theme src/theme.arv --out docs/tokens

# JSON for custom tooling (Figma sync, swatch pages)
arvia gen --docs --format json --theme src/theme.arv --out docs/tokens

# CSF stories from every component's variants and defaults
arvia gen --storybook --theme src/theme.arv --out stories src/`}
      />
      <DocP>
        <fbt desc="Docs content — cli: modes pointers">
          {
            "Catalog generation is covered in Token docs; story generation in Storybook. Both modes load their generator packages (@arviahq/docs, @arviahq/storybook) on demand — install the one you use."
          }
        </fbt>
      </DocP>
      <DocCallout tone="tip">
        <fbt desc="Docs note — cli: prefer arvia-tsc">
          {
            "For day-to-day type checking prefer `arvia-tsc` (from the TypeScript plugin package) over generated siblings: it type-checks `.arv` imports virtually, leaving your working tree clean."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
