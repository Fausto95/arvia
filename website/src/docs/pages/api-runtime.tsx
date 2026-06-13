import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const api_runtimeMeta: DocPageMeta = {
  slug: "api-runtime",
  title: <fbt desc="Docs page title — Runtime API">{"Runtime API"}</fbt>,
  description: (
    <fbt desc="Docs page description — What a compiled .arv exports.">
      {"What importing a compiled .arv file gives you at runtime."}
    </fbt>
  ),
  nav: { section: "api", order: 0 },
  searchText:
    'Importing a compiled .arv file gives you plain JavaScript. A component becomes a function: ComponentName(props?) returns an object with one class-name string per slot — { root, icon, ... }. props is optional; each variant is a key whose value is a string union, or an object for per-breakpoint values: Button({ size: { initial: "sm", md: "lg" } }). A style becomes a string constant: export const truncate = "truncate_x". A theme file exports tokens: an object of group.name to its value — a literal in single-mode themes, or a var() reference with modes. Exports table: component → function returning slot classes; style → string; theme tokens → tokens object; types ComponentNameProps and ComponentNameSlots are generated too. Related: Compiler API, Components.',
};

export function ApiRuntimePage() {
  return (
    <DocArticle meta={api_runtimeMeta}>
      <DocP>
        <fbt desc="Docs content — api-runtime: intro">
          {
            "Importing a compiled `.arv` file gives you plain JavaScript — no framework, no runtime library. Here's what each construct exports."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: component function">{"The component function"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — api-runtime: component">
          {
            "A component becomes a function. Call it with optional props; it returns an object with one class-name string per slot:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"usage"}
        code={`import { Button } from "./button.arv";

const s = Button({ tone: "danger" });
// s.root  → "Button_root_x Button_tone_danger_root_x"
// s.icon  → "Button_icon_x"   (one key per slot)

<button className={s.root}>
  <span className={s.icon}>★</span>
</button>;`}
      />
      <DocP>
        <fbt desc="Docs content — api-runtime: props">
          {
            "Each variant is a prop whose value is a string union. For per-breakpoint or per-container values, pass an object:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"responsive props"}
        code={`Button({ size: { initial: "sm", md: "lg", $wide: "lg" } });
//                        breakpoint ↑      container ↑`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: styles and tokens">{"Styles and tokens"}</fbt>
      </DocH2>
      <DocCode
        label={"exports"}
        code={`// A \`style truncate { … }\` exports a string:
import { truncate } from "./utils.arv"; // "truncate_x"

// A theme file exports its tokens as a typed object:
import { tokens } from "./theme.arv";
tokens.color.primary; // "#635bff" — or "var(--arvia-color-primary)" with modes`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: exports table">{"What each construct exports"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="API runtime table header — construct">{"Construct"}</fbt>,
          <fbt desc="API runtime table header — export">{"Export"}</fbt>,
        ]}
        rows={[
          [
            "component Name",
            <fbt desc="API runtime cell — component">
              {"`Name(props?)` → `{ [slot]: string }`, plus `NameProps` and `NameSlots` types."}
            </fbt>,
          ],
          [
            "style name",
            <fbt desc="API runtime cell — style">{"`name` — a class-name `string`."}</fbt>,
          ],
          [
            "theme tokens",
            <fbt desc="API runtime cell — tokens">
              {
                "`tokens` — `{ group: { name: value } }`, plus per-group key types like `ColorToken`."
              }
            </fbt>,
          ],
        ]}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — api-runtime: pure">
          {
            "The generated function is pure string lookups and concatenation — no style injection, no context, no theme object at runtime."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — api-runtime: related">
          {"Related: [Compiler API](/docs/api-compiler) · [Components](/docs/components)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}
