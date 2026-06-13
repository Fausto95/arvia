import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const api_compilerMeta: DocPageMeta = {
  slug: "api-compiler",
  title: <fbt desc="Docs page title — Compiler API">{"Compiler API"}</fbt>,
  description: (
    <fbt desc="Docs page description — Use the compiler directly.">
      {"The @arviahq/compiler functions, for building your own tooling."}
    </fbt>
  ),
  nav: { section: "api", order: 1 },
  searchText:
    'The @arviahq/compiler package is a plain function library — use it to integrate Arvia into a bundler other than Vite, or to build custom tooling. compile(source, options) returns { css, js, dts, cssMap, diagnostics, env, meta }. import { compile } from "@arviahq/compiler"; const result = compile(source, { filename: "button.arv" }); result.css; result.js; result.dts. Functions: compile(source, options) full compile; compileDts(source, { filename, env? }) types only; analyze(source, options) parse + check, no codegen; parse(source, filename) AST only; formatArv(source, options?) canonical formatting; renderDiagnostic(d) format a diagnostic. CompileOptions: filename, root?, env?, css?, sharedEnvFile?. Key types: CompileResult, Diagnostic, ThemeEnv. Related: Runtime API, How compilation works.',
};

export function ApiCompilerPage() {
  return (
    <DocArticle meta={api_compilerMeta}>
      <DocP>
        <fbt desc="Docs content — api-compiler: intro">
          {
            "`@arviahq/compiler` is a plain function library. Reach for it to integrate Arvia into a bundler other than Vite, or to build custom tooling. The main entry point is `compile`:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"node"}
        code={`import { compile } from "@arviahq/compiler";

const result = compile(source, { filename: "button.arv" });
result.css;          // generated CSS (string | null on error)
result.js;           // generated runtime module
result.dts;          // TypeScript declarations
result.diagnostics;  // errors and warnings`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: functions">{"Functions"}</fbt>
      </DocH2>
      <DocTable
        headers={[
          <fbt desc="API compiler table header — function">{"Function"}</fbt>,
          <fbt desc="API compiler table header — returns">{"Returns"}</fbt>,
        ]}
        rows={[
          [
            "compile(source, options)",
            <fbt desc="API compiler cell — compile">
              {"Full compile → `{ css, js, dts, cssMap, diagnostics, env, meta }`."}
            </fbt>,
          ],
          [
            "compileDts(source, { filename, env? })",
            <fbt desc="API compiler cell — compileDts">
              {"Fast types-only path → `{ dts, anchors }`."}
            </fbt>,
          ],
          [
            "analyze(source, options)",
            <fbt desc="API compiler cell — analyze">
              {
                "Parse + check, no codegen → `{ ast, diagnostics, env }`. Used by the language server."
              }
            </fbt>,
          ],
          [
            "parse(source, filename)",
            <fbt desc="API compiler cell — parse">
              {"Lexer + parser → `{ ast, diagnostics }` (recovers past errors)."}
            </fbt>,
          ],
          [
            "formatArv(source, options?)",
            <fbt desc="API compiler cell — format">
              {"Canonical formatting → `string` (fails closed)."}
            </fbt>,
          ],
          [
            "renderDiagnostic(d)",
            <fbt desc="API compiler cell — renderDiagnostic">
              {"Format one diagnostic for display → `string`."}
            </fbt>,
          ],
        ]}
      />
      <DocH2>
        <fbt desc="Docs content — heading: options and types">{"Options & key types"}</fbt>
      </DocH2>
      <DocCode
        label={"types"}
        code={`interface CompileOptions {
  filename: string;          // for diagnostics and the stable class-name hash
  root?: string;             // project root, for path-relative hashing
  env?: ThemeEnv;            // shared theme environment (from the theme file)
  css?: false | "names" | "syntax"; // CSS validation level
  sharedEnvFile?: boolean;   // suppress unused-in-file warnings (theme files)
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — api-compiler: env">
          {
            "To resolve `color.primary` and friends, compile the theme file first and pass its `result.env` as `options.env` to every other file — that's exactly what the Vite plugin does."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — api-compiler: related">
          {
            "Related: [Runtime API](/docs/api-runtime) · [How compilation works](/docs/compilation)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}
