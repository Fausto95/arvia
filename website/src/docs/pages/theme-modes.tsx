import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const theme_modesMeta: DocPageMeta = {
  slug: "theme-modes",
  title: <fbt desc="Docs page title — Theme modes">{"Theme modes"}</fbt>,
  description: (
    <fbt desc="Docs page description — Light and dark with zero JavaScript.">
      {"Light and dark tokens that flip with no runtime."}
    </fbt>
  ),
  nav: { section: "language", order: 1 },
  searchText:
    'Declare modes at the top of the theme, then give any token a per-mode value with @mode. theme { modes: light | dark; color { text = #18181b; surface = #ffffff; @dark { text = #f4f4f5; surface = #18181b; } } } Tokens that change between modes compile to CSS variables (--arvia-color-text) that flip automatically: :root holds the light values and [data-arvia-theme="dark"] holds the dark ones, and the page follows the OS color scheme by default. Tokens without a @mode override stay inlined. Switch manually by setting data-arvia-theme="dark" on <html>. No JavaScript runs to restyle — it is plain CSS variables. Related: Theme, Token docs.',
};

export function ThemeModesPage() {
  return (
    <DocArticle meta={theme_modesMeta}>
      <DocP>
        <fbt desc="Docs content — modes: what">
          {
            "Declare `modes` at the top of the theme, then give any token a per-mode value with `@mode`:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  modes: light | dark;

  color {
    text = #18181b;
    surface = #ffffff;

    @dark {
      text = #f4f4f5;
      surface = #18181b;
    }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — modes: generates">
          {
            'Tokens that change between modes compile to CSS variables that flip automatically — `:root` holds the light values, `[data-arvia-theme="dark"]` the dark ones. Tokens without a `@mode` override stay inlined.'
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`:root { --arvia-color-text: #18181b; }
[data-arvia-theme="dark"] { --arvia-color-text: #f4f4f5; }`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — modes: switching">
          {
            'By default the page follows the OS color scheme. To switch manually, set `data-arvia-theme="dark"` on `<html>` — no JavaScript runs to restyle, it\'s just CSS variables.'
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — modes: related">
          {"[Theme & tokens](/docs/theme) · [Token docs](/docs/token-docs)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
