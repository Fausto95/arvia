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
    <fbt desc="Docs page description — The arvia gen command.">
      {"arvia gen: declarations, token catalogs, and Storybook stories."}
    </fbt>
  ),
  nav: { section: "tooling", order: 2 },
  searchText:
    "The arvia CLI ships with every framework package. Its one command, gen, has three modes. arvia gen [dir] writes type declarations (default: central, into .arvia/types) — run it before tsc in CI: arvia gen src. Flags: --dts-mode central|sibling (default central), --dts-dir <dir> (default .arvia/types), --src-root <dir> (default src), --clean. arvia gen --docs writes a token catalog (default docs/tokens; --format md|json). arvia gen --storybook writes CSF stories (default stories). Both load their generator package on demand (@arviahq/docs, @arviahq/storybook). Related: Type checking, Token docs, Storybook.",
};

export function CliPage() {
  return (
    <DocArticle meta={cliMeta}>
      <DocP>
        <fbt desc="Docs content — cli: what">
          {
            "The `arvia` CLI ships with every framework package. Its one command, `gen`, has three modes: emit type declarations (the default), a token catalog (`--docs`), or Storybook stories (`--storybook`)."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: declarations">{"Declarations"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — cli: declarations">
          {
            "`arvia gen src` compiles every `.arv` file and writes its declarations — by default into `.arvia/types` (central mode). Run it before `tsc` in CI so types exist without starting Vite:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"terminal"}
        code={`arvia gen src        # writes .arvia/types/**
arvia gen src --clean    # wipe the central dir first`}
      />
      <DocTable
        headers={[
          <fbt desc="CLI table header — flag">{"Flag"}</fbt>,
          <fbt desc="CLI table header — meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "--dts-mode central|sibling",
            <fbt desc="CLI cell — dts-mode">{"Where declarations go. Default `central`."}</fbt>,
          ],
          [
            "--dts-dir <dir>",
            <fbt desc="CLI cell — dts-dir">{"Central directory. Default `.arvia/types`."}</fbt>,
          ],
          [
            "--src-root <dir>",
            <fbt desc="CLI cell — src-root">{"Mirrored source root. Default `src`."}</fbt>,
          ],
          [
            "--clean",
            <fbt desc="CLI cell — clean">{"Wipe the central dir before generating."}</fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: catalogs and stories">{"Catalogs & stories"}</fbt>
      </DocH2>
      <DocCode
        label={"terminal"}
        code={`# Token catalog (Markdown or JSON)
arvia gen --docs --theme src/theme.arv --out docs/tokens

# Storybook CSF stories from every component
arvia gen --storybook --theme src/theme.arv --out stories src`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — cli: on-demand">
          {
            "`--docs` and `--storybook` load their generator package on demand (`@arviahq/docs`, `@arviahq/storybook`) — install the one you use. See [Token docs](/docs/token-docs) and [Storybook](/docs/storybook)."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — cli: related">
          {"Related: [Type checking](/docs/typecheck) · [Storybook](/docs/storybook)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
