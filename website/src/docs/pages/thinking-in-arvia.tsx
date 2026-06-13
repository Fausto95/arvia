import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocLi } from "../../components/docs/DocLi";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const thinking_in_arviaMeta: DocPageMeta = {
  slug: "thinking-in-arvia",
  title: <fbt desc="Docs page title — Thinking in Arvia">{"Thinking in Arvia"}</fbt>,
  description: (
    <fbt desc="Docs page description — The mental model behind Arvia.">
      {"The mental model: what the compiler does for you, and which construct to reach for."}
    </fbt>
  ),
  nav: { section: "deep-dives", order: 0 },
  searchText:
    "Arvia becomes easy once you internalize one model: an `.arv` file is not a stylesheet, it is a description of decisions — what tokens exist, what variants a component offers, what changes at a breakpoint. The compiler turns those decisions into CSS classes and a function that picks the right ones. This page builds that model. You author decisions, not classes In hand-written CSS, a button with two sizes and two tones means you invent class names, remember which combine with which, and keep the markup in sync. In Arvia you state the decision space — size is sm or lg, tone is primary or danger — and the compiler derives everything mechanical: the classes, the cascade order, the TypeScript types, the function that maps props to class strings. A useful consequence: invalid combinations are unrepresentable. There is no way to apply a size the component does not declare, misspell a token, or forget the compound rule for small danger buttons — the checker and the generated types catch all three before the browser is involved. One theme, visible everywhere Arvia has no import statement. Instead, one shared theme file (configured in the Vite plugin, `src/theme.arv` by convention) forms a global environment: its tokens, recipes, and keyframes are visible to every `.arv` file in the project. When `button.arv` says `color.primary` or `use FocusRing`, the compiler resolves the name against that environment — that is the whole module system. This is a deliberate trade. Design tokens are global by nature — a spacing scale that differs per file is a bug, not flexibility. Making the theme ambient removes the import ceremony from every file while keeping references fully checked: an unknown token is a compile error with a did-you-mean suggestion, not a silently broken style. Scoping still exists where it matters: a component's `tokens` block declares values visible only inside that component, shadowing the theme. Global by default, local by choice. Choosing the right construct Four constructs produce styles, and they form a ladder of capability. Start at the top and stop as soon as your need is met: Reach for When It gives you global The rule targets the document itself: resets, body typography, third-party class overrides. Raw CSS rules, emitted verbatim with tokens resolved. style One reusable class with no props: a truncation helper, a layout utility. A single hashed class exported as a string constant. recipe A fragment shared across components — focus rings, surfaces — that should not exist as a class of its own. Declarations inlined wherever 'use' pulls them in; zero output by itself. component Anything with props: variants, multiple styled elements (slots), responsive or compound behavior. A typed function returning one class string per slot. Two common graduations: a style that wants a second visual flavor becomes a component with one variant; a clump of declarations copy-pasted between two components becomes a recipe. The compiler nudges you — putting variants inside a style is an error whose message says to use a component. Variant or compound? Token or local token? A variant is an axis callers choose (size, tone). A `compound` block is extra styling for a specific combination of axes — it adds no props, it refines existing ones. A theme token is a system-wide decision (your spacing scale). A local token is a component implementation detail (this chip's exact pill radius) — real values with names, but no global footprint. A `responsive` block follows the viewport; a `container` block follows the component's own rendered width. Prefer containers for anything that can appear in both a sidebar and a main column. Trust the output Because class names are hashed from the file path and component name — never from the style content — editing a padding value changes only the CSS, byte-for-byte leaving the JS alone. That is why dev-server updates are instant CSS swaps, and why the generated output stays diffable and predictable in production. When you want to see exactly what you shipped, read [How compilation works](/docs/compilation).",
};

export function ThinkingInArviaPage() {
  return (
    <DocArticle meta={thinking_in_arviaMeta}>
      <DocP>
        <fbt desc="Docs content — thinking: opening">
          {
            "Arvia becomes easy once you internalize one model: an `.arv` file is not a stylesheet, it is a description of decisions — what tokens exist, what variants a component offers, what changes at a breakpoint. The compiler turns those decisions into CSS classes and a function that picks the right ones. This page builds that model."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: decisions">{"You author decisions, not classes"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — thinking: decision space">
          {
            "In hand-written CSS, a button with two sizes and two tones means you invent class names, remember which combine with which, and keep the markup in sync. In Arvia you state the decision space — size is sm or lg, tone is primary or danger — and the compiler derives everything mechanical: the classes, the cascade order, the TypeScript types, the function that maps props to class strings."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — thinking: unrepresentable">
          {
            "A useful consequence: invalid combinations are unrepresentable. There is no way to apply a size the component does not declare, misspell a token, or forget the compound rule for small danger buttons — the checker and the generated types catch all three before the browser is involved."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: one theme">{"One theme, visible everywhere"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — thinking: shared environment">
          {
            "Arvia has no import statement. Instead, one shared theme file (configured in the Vite plugin, `src/theme.arv` by convention) forms a global environment: its tokens, recipes, and keyframes are visible to every `.arv` file in the project. When `button.arv` says `color.primary` or `use FocusRing`, the compiler resolves the name against that environment — that is the whole module system."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — thinking: why ambient">
          {
            "This is a deliberate trade. Design tokens are global by nature — a spacing scale that differs per file is a bug, not flexibility. Making the theme ambient removes the import ceremony from every file while keeping references fully checked: an unknown token is a compile error with a did-you-mean suggestion, not a silently broken style."
          }
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — thinking: local tokens exist">
          {
            "Scoping still exists where it matters: a component's `tokens` block declares values visible only inside that component, shadowing the theme. Global by default, local by choice."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: right construct">{"Choosing the right construct"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — thinking: ladder lead-in">
          {
            "Four constructs produce styles, and they form a ladder of capability. Start at the top and stop as soon as your need is met:"
          }
        </fbt>
      </DocP>
      <DocTable
        headers={[
          <fbt desc="Docs table header — reach for">{"Reach for"}</fbt>,
          <fbt desc="Docs table header — when">{"When"}</fbt>,
          <fbt desc="Docs table header — it gives you">{"It gives you"}</fbt>,
        ]}
        rows={[
          [
            "global",
            <fbt desc="Docs table cell — when global">
              {
                "The rule targets the document itself: resets, body typography, third-party class overrides."
              }
            </fbt>,
            <fbt desc="Docs table cell — global gives">
              {"Raw CSS rules, emitted verbatim with tokens resolved."}
            </fbt>,
          ],
          [
            "style",
            <fbt desc="Docs table cell — when style">
              {"One reusable class with no props: a truncation helper, a layout utility."}
            </fbt>,
            <fbt desc="Docs table cell — style gives">
              {"A single hashed class exported as a string constant."}
            </fbt>,
          ],
          [
            "recipe",
            <fbt desc="Docs table cell — when recipe">
              {
                "A fragment shared across components — focus rings, surfaces — that should not exist as a class of its own."
              }
            </fbt>,
            <fbt desc="Docs table cell — recipe gives">
              {"Declarations inlined wherever 'use' pulls them in; zero output by itself."}
            </fbt>,
          ],
          [
            "component",
            <fbt desc="Docs table cell — when component">
              {
                "Anything with props: variants, multiple styled elements (slots), responsive or compound behavior."
              }
            </fbt>,
            <fbt desc="Docs table cell — component gives">
              {"A typed function returning one class string per slot."}
            </fbt>,
          ],
        ]}
      />
      <DocP>
        <fbt desc="Docs content — thinking: graduations">
          {
            "Two common graduations: a style that wants a second visual flavor becomes a component with one variant; a clump of declarations copy-pasted between two components becomes a recipe. The compiler nudges you — putting variants inside a style is an error whose message says to use a component."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: finer choices">
          {"Variant or compound? Token or local token?"}
        </fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list item — variant vs compound">
            {
              "A variant is an axis callers choose (size, tone). A `compound` block is extra styling for a specific combination of axes — it adds no props, it refines existing ones."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — theme vs local token">
            {
              "A theme token is a system-wide decision (your spacing scale). A local token is a component implementation detail (this chip's exact pill radius) — real values with names, but no global footprint."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list item — responsive vs container">
            {
              "A `responsive` block follows the viewport; a `container` block follows the component's own rendered width. Prefer containers for anything that can appear in both a sidebar and a main column."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocH2>
        <fbt desc="Docs content — heading: trust the output">{"Trust the output"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — thinking: trust output">
          {
            "Because class names are hashed from the file path and component name — never from the style content — editing a padding value changes only the CSS, byte-for-byte leaving the JS alone. That is why dev-server updates are instant CSS swaps, and why the generated output stays diffable and predictable in production. When you want to see exactly what you shipped, read [How compilation works](/docs/compilation)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
