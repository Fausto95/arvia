import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const compilationMeta: DocPageMeta = {
  slug: "compilation",
  title: <fbt desc="Docs page title — How compilation works">{"How compilation works"}</fbt>,
  description: (
    <fbt desc="Docs page description — The compilation pipeline in depth.">
      {"The pipeline from .arv source to CSS, JS, and types — and why HMR is instant."}
    </fbt>
  ),
  nav: { section: "deep-dives", order: 20 },
  searchText:
    'Nothing in Arvia is magic, and this page proves it: we follow one file through the compiler and read what comes out. Understanding the output makes debugging trivial — DevTools shows you class names you can decode at a glance. The pipeline Stage What it does Lexer Tokenizes the source. CSS values and selectors are captured as raw text, so any value the browser accepts passes through. Parser Builds the syntax tree, with error recovery — one mistake produces one diagnostic, not a cascade. Checker Validates everything nameable: token refs, recipe refs and cycles, slots, variants, defaults, compound matchers, CSS property names and value syntax. Produces did-you-mean fixes. IR builder Flattens the tree: recipes are inlined, token references resolved, slots materialized, class names assigned. Emitters Three independent generators write the CSS, the JS module, and the `.d.ts` declarations from the same IR. Errors stop emission — a file with an error produces diagnostics and no artifacts, so a broken component can never ship half-styled. Warnings (unknown CSS property ARV180, suspicious value syntax ARV181, unused recipe ARV172…) emit normally. Class names and the hash Every class follows `Component_variant_value_slot_hash`. The 6-character hash is FNV-1a over the file\'s project-relative path plus the component name — crucially, not over the styles: the scheme .Button_root_0p4oom { }                       /* base, root slot */\n.Button_icon_0p4oom { }                       /* base, icon slot */\n.Button_size_lg_root_0p4oom { }               /* variant value */\n.Button_size_sm_tone_danger_root_0p4oom { }   /* compound */\n.Button_size_lg_bp_md_root_0p4oom { }         /* responsive (breakpoint md) */\n.Button_layout_row_cq_wide_root_0p4oom { }    /* container (size wide) */ Path-based hashing has two consequences. Components with the same name in different files never collide. And editing styles never changes a class name — which is the foundation of the HMR story below. The trade-off: moving or renaming a file changes its hashes, which only matters if you cache generated CSS across deploys keyed by class name. The generated JavaScript The JS module is data plus one small helper. Per component: a base class map, a variants table, `compound` entries, defaults, and responsive/container tables. The exported function delegates to a shared helper that walks them: generated JS (abridged) const Button_base = { root: "Button_root_0p4oom", icon: "Button_icon_0p4oom" };\n\nconst Button_variants = {\n  size: {\n    sm: { root: "Button_size_sm_root_0p4oom" },\n    lg: { root: "Button_size_lg_root_0p4oom", icon: "Button_size_lg_icon_0p4oom" },\n  },\n  tone: { /* … */ },\n};\n\nconst Button_compounds = [\n  [{ size: "sm", tone: "danger" }, { root: "Button_size_sm_tone_danger_root_0p4oom" }],\n];\n\nconst Button_defaults = { size: "md", tone: "primary" };\n\nexport function Button(props) {\n  return _h(Button_base, Button_variants, Button_compounds, Button_defaults,\n            /* responsive/container tables */ …, ["root", "icon"], props);\n} The helper, per slot: start from the base class; add the class for each variant\'s effective value (prop or default, with object props contributing their initial plus per-breakpoint classes); add author-time responsive and container overrides for variants the caller did not pin; then add every compound whose matchers all equal the effective values. String concatenation throughout — measure it and you will find it indistinguishable from a hardcoded className. The generated declarations generated .d.ts export type ButtonProps = {\n  size?: "sm" | "md" | "lg" | { initial?: "sm" | "md" | "lg"; md?: "sm" | "md" | "lg"; };\n  tone: "primary" | "danger";    // no default → required\n};\n\nexport type ButtonSlots = { root: string; icon: string; };\n\nexport declare function Button(props: ButtonProps): ButtonSlots; Note the encoding of the rules you have met elsewhere: defaults decide optionality, responsive/`container` blocks decide whether the object form exists and which keys it has, and slots become the return type. In dev, these declarations are served virtually by the TypeScript plugin; `arvia gen` writes them to disk when you want them material. Why HMR is instant Put the pieces together: class names do not depend on style content, so editing a padding produces a JS module byte-identical to the previous one. The Vite plugin compares, sees only CSS changed, and swaps the stylesheet through a phantom <file>`.arv`.css module — no JS re-execution, no React re-render, styles update in place. Edit the theme file instead and the equation flips: tokens are inlined everywhere (or feed every `var()`), so any file may be stale — the plugin resets its caches and triggers a full reload. Structural component edits (new variant, new slot) change the JS too and update the module graph normally. Determinism is a design goal: same input, same bytes out, no timestamps. Generated artifacts diff cleanly in CI, and build caches hit reliably.',
};

export function CompilationPage() {
  return (
    <DocArticle meta={compilationMeta}>
      <DocP>
        <fbt desc="Docs content — compilation: opening">
          {
            "Nothing in Arvia is magic, and this page proves it: we follow one file through the compiler and read what comes out. Understanding the output makes debugging trivial — DevTools shows you class names you can decode at a glance."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: pipeline">{"The pipeline"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="Docs table header — stage">{"Stage"}</fbt>,
          <fbt desc="Docs table header — stage what">{"What it does"}</fbt>,
        ]}
        rows={[
          [
            <fbt desc="Docs table cell — lexer">{"Lexer"}</fbt>,
            <fbt desc="Docs table cell — lexer what">
              {
                "Tokenizes the source. CSS values and selectors are captured as raw text, so any value the browser accepts passes through."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — parser">{"Parser"}</fbt>,
            <fbt desc="Docs table cell — parser what">
              {
                "Builds the syntax tree, with error recovery — one mistake produces one diagnostic, not a cascade."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — checker">{"Checker"}</fbt>,
            <fbt desc="Docs table cell — checker what">
              {
                "Validates everything nameable: token refs, recipe refs and cycles, slots, variants, defaults, compound matchers, CSS property names and value syntax. Produces did-you-mean fixes."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — ir">{"IR builder"}</fbt>,
            <fbt desc="Docs table cell — ir what">
              {
                "Flattens the tree: recipes are inlined, token references resolved, slots materialized, class names assigned."
              }
            </fbt>,
          ],
          [
            <fbt desc="Docs table cell — emitters">{"Emitters"}</fbt>,
            <fbt desc="Docs table cell — emitters what">
              {
                "Three independent generators write the CSS, the JS module, and the `.d.ts` declarations from the same IR."
              }
            </fbt>,
          ],
        ]}
      />
      <DocP>
        <fbt desc="Docs content — compilation: errors stop emission">
          {
            "Errors stop emission — a file with an error produces diagnostics and no artifacts, so a broken component can never ship half-styled. Warnings (unknown CSS property ARV180, suspicious value syntax ARV181, unused recipe ARV172…) emit normally."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: hash">{"Class names and the hash"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — compilation: hash lead-in">
          {
            "Every class follows `Component_variant_value_slot_hash`. The 6-character hash is FNV-1a over the file's project-relative path plus the component name — crucially, not over the styles:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"the scheme"}
        lang={"css"}
        code={`.Button_root_0p4oom { }                       /* base, root slot */
.Button_icon_0p4oom { }                       /* base, icon slot */
.Button_size_lg_root_0p4oom { }               /* variant value */
.Button_size_sm_tone_danger_root_0p4oom { }   /* compound */
.Button_size_lg_bp_md_root_0p4oom { }         /* responsive (breakpoint md) */
.Button_layout_row_cq_wide_root_0p4oom { }    /* container (size wide) */`}
      />
      <DocP>
        <fbt desc="Docs content — compilation: hash consequences">
          {
            "Path-based hashing has two consequences. Components with the same name in different files never collide. And editing styles never changes a class name — which is the foundation of the HMR story below. The trade-off: moving or renaming a file changes its hashes, which only matters if you cache generated CSS across deploys keyed by class name."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: generated js">{"The generated JavaScript"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — compilation: js lead-in">
          {
            "The JS module is data plus one small helper. Per component: a base class map, a variants table, `compound` entries, defaults, and responsive/container tables. The exported function delegates to a shared helper that walks them:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated JS (abridged)"}
        lang={"js"}
        code={`const Button_base = { root: "Button_root_0p4oom", icon: "Button_icon_0p4oom" };

const Button_variants = {
  size: {
    sm: { root: "Button_size_sm_root_0p4oom" },
    lg: { root: "Button_size_lg_root_0p4oom", icon: "Button_size_lg_icon_0p4oom" },
  },
  tone: { /* … */ },
};

const Button_compounds = [
  [{ size: "sm", tone: "danger" }, { root: "Button_size_sm_tone_danger_root_0p4oom" }],
];

const Button_defaults = { size: "md", tone: "primary" };

export function Button(props) {
  return _h(Button_base, Button_variants, Button_compounds, Button_defaults,
            /* responsive/container tables */ …, ["root", "icon"], props);
}`}
      />
      <DocP>
        <fbt desc="Docs content — compilation: helper algorithm">
          {
            "The helper, per slot: start from the base class; add the class for each variant's effective value (prop or default, with object props contributing their initial plus per-breakpoint classes); add author-time responsive and container overrides for variants the caller did not pin; then add every compound whose matchers all equal the effective values. String concatenation throughout — measure it and you will find it indistinguishable from a hardcoded className."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: generated dts">{"The generated declarations"}</fbt>
      </DocH2>
      <DocCode
        label={"generated .d.ts"}
        code={`export type ButtonProps = {
  size?: "sm" | "md" | "lg" | { initial?: "sm" | "md" | "lg"; md?: "sm" | "md" | "lg"; };
  tone: "primary" | "danger";    // no default → required
};

export type ButtonSlots = { root: string; icon: string; };

export declare function Button(props: ButtonProps): ButtonSlots;`}
      />
      <DocP>
        <fbt desc="Docs content — compilation: dts encoding">
          {
            "Note the encoding of the rules you have met elsewhere: defaults decide optionality, responsive/`container` blocks decide whether the object form exists and which keys it has, and slots become the return type. In dev, these declarations are served virtually by the TypeScript plugin; `arvia gen` writes them to disk when you want them material."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: why hmr instant">{"Why HMR is instant"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — compilation: hmr css only">
          {
            "Put the pieces together: class names do not depend on style content, so editing a padding produces a JS module byte-identical to the previous one. The Vite plugin compares, sees only CSS changed, and swaps the stylesheet through a phantom <file>`.arv`.css module — no JS re-execution, no React re-render, styles update in place."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — compilation: hmr theme edits">
          {
            "Edit the theme file instead and the equation flips: tokens are inlined everywhere (or feed every `var()`), so any file may be stale — the plugin resets its caches and triggers a full reload. Structural component edits (new variant, new slot) change the JS too and update the module graph normally."
          }
        </fbt>
      </DocP>
      <DocCallout tone="tip">
        <fbt desc="Docs note — compilation: determinism">
          {
            "Determinism is a design goal: same input, same bytes out, no timestamps. Generated artifacts diff cleanly in CI, and build caches hit reliably."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
