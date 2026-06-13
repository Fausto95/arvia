import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const diagnosticsMeta: DocPageMeta = {
  slug: "diagnostics",
  title: <fbt desc="Docs page title — Diagnostics reference">{"Diagnostics reference"}</fbt>,
  description: (
    <fbt desc="Docs page description — Diagnostics reference.">
      {"Every ARV code the compiler can emit, what it means, and how to fix it."}
    </fbt>
  ),
  nav: { section: "tooling", order: 5 },
  searchText:
    "Arvia diagnostics are numbered by area, carry a severity, and where possible a did-you-mean hint with a structured fix your editor can apply in one action. Errors stop the compiler from emitting CSS/JS/types for that file; warnings compile normally. The same codes appear everywhere — build output, editor squiggles, and `arvia gen`. Syntax (ARV001–ARV010) Code Severity Meaning ARV001 error Unexpected character — something the lexer cannot start a token with. ARV002 error Unterminated `/* … */` block comment. ARV003 error Bad declaration value: an unterminated string, or no value before the `;`. ARV004 error Malformed selector — missing `{` after it, or a `{` with no selector before it. ARV010 error General parse error — unexpected token for the current construct. The message names exactly what was expected; the parser recovers and keeps checking the rest of the file. Names & references (ARV101–ARV103) Code Severity Meaning ARV101 error Unknown token reference (`color.primry`) — only fires for known theme groups, so ordinary dotted CSS values pass. Comes with a did-you-mean fix. Also used for forward references between theme tokens: define before use. ARV102 error `use` names a recipe that does not exist. The hint tells you when the name is actually a style — styles cannot be `use`d. ARV103 error Recipe cycle — A uses B uses A. Duplicates & naming (ARV110–ARV119) Code Severity Meaning ARV110 error Duplicate component name in one file. ARV111 error Duplicate recipe name in one file. ARV112 error Duplicate theme group, token, breakpoint, or container size — each value has exactly one home per file. ARV113 error Duplicate slot, including redeclaring the implicit `root`. ARV114 error Duplicate variant axis or duplicate value within an axis. ARV115 error Duplicate section block — a component allows one `base`, one `slots`, etc. ARV116 error Component or style name is not a valid JavaScript identifier (they become exports). ARV117 error Duplicate style name, or a style clashing with a component name. ARV118 error Duplicate local token inside a component `tokens` block. ARV119 error Mode override inside component tokens — local tokens are compile-time constants; moded values belong in the theme. Component structure (ARV120–ARV126) Code Severity Meaning ARV120 error A sub-block targets a slot the component never declared. Did-you-mean fix included. ARV121 error Compound matcher names an unknown variant axis. ARV122 error Compound matcher names an unknown value for a known axis. ARV123 warning Empty compound — no matchers or no styles. Compilation continues; the block does nothing. ARV124 error `defaults` references an unknown variant or value. Fix included. ARV125 error A component or style named `tokens` in a file that exports theme tokens — it would collide with the `tokens` export. ARV126 error The same variant matched twice in one compound block. Theme modes (ARV130–ARV136) Code Severity Meaning ARV130 error A `modes:` declaration in a regular file conflicts with the shared theme's modes — modes are declared once, in the theme file. ARV131 error `modes:` lists fewer than two mode names. ARV132 error `@mode` override for a mode that is not in the `modes:` list. ARV133 error Mode override for a token that has no base declaration — declare the token first. ARV134 error `@mode` override used without any `modes:` declaration. ARV135 error Mode override on a breakpoint token — breakpoints cannot vary per mode. ARV136 error Mode override on a container size token — same rule as breakpoints. Responsive & containers (ARV140–ARV144, ARV160–ARV164) Code Severity Meaning ARV140 / ARV160 error Duplicate breakpoint (or container size) entry in one `responsive` / `container` block. ARV141 / ARV161 error Unknown breakpoint or container size — declare them in `theme { breakpoint { … } }` / `theme { container { … } }`. ARV142 / ARV162 error The same variant overridden twice at one breakpoint / container size. ARV143 / ARV163 error Override references an unknown variant axis. ARV144 / ARV164 error Override references an unknown value for a known axis. Keyframes (ARV150–ARV151) Code Severity Meaning ARV150 error Duplicate `keyframes` name in one file. ARV151 error `keyframes.name` reference to an animation that does not exist. Did-you-mean hint included. Unused declarations (ARV171–ARV173) Code Severity Meaning ARV171 warning A component-local token nothing references — provably dead, since locals have one consumer. ARV172 warning A file-local recipe nothing uses. Suppressed for the shared theme file, whose consumers live elsewhere. ARV173 warning A variant axis with no values. CSS checks (ARV180–ARV181) Code Severity Meaning ARV180 warning Unknown CSS property name (`colr:`) — custom properties (`--x`) are exempt. Did-you-mean fix included. ARV181 warning Value doesn't match the property's expected syntax (`display: 12px`). Skipped for values containing `var()` and unresolved refs, and tolerates `!important`. The CSS checks are configurable when you call the compiler yourself: `css: \"names\"` keeps property-name checks but skips value syntax, `css: false` disables both. The Vite plugin runs them in full.",
};

export function DiagnosticsPage() {
  return (
    <DocArticle meta={diagnosticsMeta}>
      <DocP>
        <fbt desc="Docs content — diagnostics: opening">
          {
            "Arvia diagnostics are numbered by area, carry a severity, and where possible a did-you-mean hint with a structured fix your editor can apply in one action. Errors stop the compiler from emitting CSS/JS/types for that file; warnings compile normally. The same codes appear everywhere — build output, editor squiggles, and `arvia gen`."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: diag syntax">{"Syntax (ARV001–ARV010)"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV001",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 001">
              {"Unexpected character — something the lexer cannot start a token with."}
            </fbt>,
          ],
          [
            "ARV002",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 002">{"Unterminated `/* … */` block comment."}</fbt>,
          ],
          [
            "ARV003",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 003">
              {"Bad declaration value: an unterminated string, or no value before the `;`."}
            </fbt>,
          ],
          [
            "ARV004",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 004">
              {"Malformed selector — missing `{` after it, or a `{` with no selector before it."}
            </fbt>,
          ],
          [
            "ARV010",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 010">
              {
                "General parse error — unexpected token for the current construct. The message names exactly what was expected; the parser recovers and keeps checking the rest of the file."
              }
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: diag refs">{"Names & references (ARV101–ARV103)"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV101",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 101">
              {
                "Unknown token reference (`color.primry`) — only fires for known theme groups, so ordinary dotted CSS values pass. Comes with a did-you-mean fix. Also used for forward references between theme tokens: define before use."
              }
            </fbt>,
          ],
          [
            "ARV102",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 102">
              {
                "`use` names a recipe that does not exist. The hint tells you when the name is actually a style — styles cannot be `use`d."
              }
            </fbt>,
          ],
          [
            "ARV103",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 103">{"Recipe cycle — A uses B uses A."}</fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: diag dup">{"Duplicates & naming (ARV110–ARV119)"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV110",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 110">{"Duplicate component name in one file."}</fbt>,
          ],
          [
            "ARV111",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 111">{"Duplicate recipe name in one file."}</fbt>,
          ],
          [
            "ARV112",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 112">
              {
                "Duplicate theme group, token, breakpoint, or container size — each value has exactly one home per file."
              }
            </fbt>,
          ],
          [
            "ARV113",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 113">
              {"Duplicate slot, including redeclaring the implicit `root`."}
            </fbt>,
          ],
          [
            "ARV114",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 114">
              {"Duplicate variant axis or duplicate value within an axis."}
            </fbt>,
          ],
          [
            "ARV115",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 115">
              {"Duplicate section block — a component allows one `base`, one `slots`, etc."}
            </fbt>,
          ],
          [
            "ARV116",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 116">
              {
                "Component or style name is not a valid JavaScript identifier (they become exports)."
              }
            </fbt>,
          ],
          [
            "ARV117",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 117">
              {"Duplicate style name, or a style clashing with a component name."}
            </fbt>,
          ],
          [
            "ARV118",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 118">
              {"Duplicate local token inside a component `tokens` block."}
            </fbt>,
          ],
          [
            "ARV119",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 119">
              {
                "Mode override inside component tokens — local tokens are compile-time constants; moded values belong in the theme."
              }
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: diag component">
          {"Component structure (ARV120–ARV126)"}
        </fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV120",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 120">
              {
                "A sub-block targets a slot the component never declared. Did-you-mean fix included."
              }
            </fbt>,
          ],
          [
            "ARV121",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 121">
              {"Compound matcher names an unknown variant axis."}
            </fbt>,
          ],
          [
            "ARV122",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 122">
              {"Compound matcher names an unknown value for a known axis."}
            </fbt>,
          ],
          [
            "ARV123",
            <fbt desc="Docs table cell — severity warning">{"warning"}</fbt>,
            <fbt desc="Docs table cell — diag 123">
              {
                "Empty compound — no matchers or no styles. Compilation continues; the block does nothing."
              }
            </fbt>,
          ],
          [
            "ARV124",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 124">
              {"`defaults` references an unknown variant or value. Fix included."}
            </fbt>,
          ],
          [
            "ARV125",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 125">
              {
                "A component or style named `tokens` in a file that exports theme tokens — it would collide with the `tokens` export."
              }
            </fbt>,
          ],
          [
            "ARV126",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 126">
              {"The same variant matched twice in one compound block."}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: diag modes">{"Theme modes (ARV130–ARV136)"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV130",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 130">
              {
                "A `modes:` declaration in a regular file conflicts with the shared theme's modes — modes are declared once, in the theme file."
              }
            </fbt>,
          ],
          [
            "ARV131",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 131">
              {"`modes:` lists fewer than two mode names."}
            </fbt>,
          ],
          [
            "ARV132",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 132">
              {"`@mode` override for a mode that is not in the `modes:` list."}
            </fbt>,
          ],
          [
            "ARV133",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 133">
              {"Mode override for a token that has no base declaration — declare the token first."}
            </fbt>,
          ],
          [
            "ARV134",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 134">
              {"`@mode` override used without any `modes:` declaration."}
            </fbt>,
          ],
          [
            "ARV135",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 135">
              {"Mode override on a breakpoint token — breakpoints cannot vary per mode."}
            </fbt>,
          ],
          [
            "ARV136",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 136">
              {"Mode override on a container size token — same rule as breakpoints."}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: diag queries">
          {"Responsive & containers (ARV140–ARV144, ARV160–ARV164)"}
        </fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV140 / ARV160",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 140">
              {
                "Duplicate breakpoint (or container size) entry in one `responsive` / `container` block."
              }
            </fbt>,
          ],
          [
            "ARV141 / ARV161",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 141">
              {
                "Unknown breakpoint or container size — declare them in `theme { breakpoint { … } }` / `theme { container { … } }`."
              }
            </fbt>,
          ],
          [
            "ARV142 / ARV162",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 142">
              {"The same variant overridden twice at one breakpoint / container size."}
            </fbt>,
          ],
          [
            "ARV143 / ARV163",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 143">
              {"Override references an unknown variant axis."}
            </fbt>,
          ],
          [
            "ARV144 / ARV164",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 144">
              {"Override references an unknown value for a known axis."}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: diag keyframes">{"Keyframes (ARV150–ARV151)"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV150",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 150">
              {"Duplicate `keyframes` name in one file."}
            </fbt>,
          ],
          [
            "ARV151",
            <fbt desc="Docs table cell — severity error">{"error"}</fbt>,
            <fbt desc="Docs table cell — diag 151">
              {
                "`keyframes.name` reference to an animation that does not exist. Did-you-mean hint included."
              }
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: diag unused">
          {"Unused declarations (ARV171–ARV173)"}
        </fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV171",
            <fbt desc="Docs table cell — severity warning">{"warning"}</fbt>,
            <fbt desc="Docs table cell — diag 171">
              {
                "A component-local token nothing references — provably dead, since locals have one consumer."
              }
            </fbt>,
          ],
          [
            "ARV172",
            <fbt desc="Docs table cell — severity warning">{"warning"}</fbt>,
            <fbt desc="Docs table cell — diag 172">
              {
                "A file-local recipe nothing uses. Suppressed for the shared theme file, whose consumers live elsewhere."
              }
            </fbt>,
          ],
          [
            "ARV173",
            <fbt desc="Docs table cell — severity warning">{"warning"}</fbt>,
            <fbt desc="Docs table cell — diag 173">{"A variant axis with no values."}</fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: diag css">{"CSS checks (ARV180–ARV181)"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          "Code",
          <fbt desc="Docs table header — severity">{"Severity"}</fbt>,
          <fbt desc="Docs table header — diag meaning">{"Meaning"}</fbt>,
        ]}
        rows={[
          [
            "ARV180",
            <fbt desc="Docs table cell — severity warning">{"warning"}</fbt>,
            <fbt desc="Docs table cell — diag 180">
              {
                "Unknown CSS property name (`colr:`) — custom properties (`--x`) are exempt. Did-you-mean fix included."
              }
            </fbt>,
          ],
          [
            "ARV181",
            <fbt desc="Docs table cell — severity warning">{"warning"}</fbt>,
            <fbt desc="Docs table cell — diag 181">
              {
                "Value doesn't match the property's expected syntax (`display: 12px`). Skipped for values containing `var()` and unresolved refs, and tolerates `!important`."
              }
            </fbt>,
          ],
        ]}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — diagnostics: css option">
          {
            'The CSS checks are configurable when you call the compiler yourself: `css: "names"` keeps property-name checks but skips value syntax, `css: false` disables both. The Vite plugin runs them in full.'
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
