import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const faqMeta: DocPageMeta = {
  slug: "faq",
  title: (
    <fbt desc="Docs page title — FAQ &amp;amp;amp; troubleshooting">{"FAQ & troubleshooting"}</fbt>
  ),
  description: (
    <fbt desc="Docs page description — FAQ and troubleshooting.">
      {"The questions everyone hits in their first week, answered precisely."}
    </fbt>
  ),
  nav: { section: "getting-started", order: 3 },
  searchText:
    'My styles don\'t apply at all Almost always: the theme file was never imported. Importing a component file loads its CSS, but global rules and the `--arvia-*` token variables ship with the theme file itself — `import "./theme.arv";` once in your entry point. If a single component looks unstyled instead, check that you put `styles.root` (a string of class names) on the element, not the `styles` object. Imports from .arv are typed as any In the default central mode this means .arvia/types hasn\'t been generated yet, or rootDirs is missing. Generate the declarations (run arvia gen src, or start the dev server) and add rootDirs ["src", ".arvia/types"] to the tsconfig that includes src. If you chose dts: false, the editor needs the TypeScript plugin instead: in VS Code run “TypeScript: Select TypeScript Version” → workspace so @arviahq/typescript-plugin loads, and type-check with arvia-tsc. Full details in Type checking. Unknown token errors in every file except the theme The shared theme isn\'t being picked up, so each file is checked against an empty environment. Set `arvia({ theme: "src/theme.arv" })` in the Vite config (or move the file to the conventional `src/theme.arv`). In monorepos remember the path is relative to each app\'s Vite root — every app config points at the theme, even a shared one. Why is there no <Button> component? By design. Arvia generates styling functions, not UI components — you keep ownership of markup, refs, accessibility, and events, and the same `.arv` file serves React, Preact, Vue, or plain DOM. The pattern is a thin wrapper per framework; see [Components](/docs/components) for the canonical one. How do I style with runtime values? Arvia compiles ahead of time, so a value computed at runtime (a user-picked color, a measured width) cannot become a class. Use the platform\'s escape hatch: set an inline style or a CSS custom property, and keep everything static in the component. The `tokens` export helps mix the two worlds: ProgressBar.tsx import { ProgressBar } from "./progress.arv";\nimport { tokens } from "./theme.arv";\n\nconst s = ProgressBar();\n\n<div className={s.root}>\n  <div\n    className={s.fill}\n    style={{ width: `${percent}%`, background: accent ?? tokens.color.primary }}\n  />\n</div> Why no boolean variants? Two-value axes do the same job with better names: `state { idle {} invalid {} }` reads clearly in source and call site, and leaves room for a third state without an API break. Map your boolean at the call site: `state: invalid ? "invalid" : "idle"`. See [Variants & defaults](/docs/variants). My class names changed after I moved a file Expected: the 6-character hash comes from the file\'s project-relative path plus the component name (see [How compilation works](/docs/compilation)). Renaming or moving a file gives its components new hashes. Nothing breaks — JS and CSS regenerate together — but don\'t persist generated class names anywhere (snapshots, analytics selectors); target stable attributes instead. A style overrides my component — or refuses to Every generated class has the same single-class specificity, so stylesheet order decides ties. The order is deliberate: base → variants → responsive/container → compounds within a component, and standalone `style` declarations after all components (utilities last). If a utility must always win regardless of order, make it win on specificity explicitly — but first ask whether the property belongs in the component as a variant. Two files export the same component name Allowed — hashes keep their CSS apart — and the Vite plugin warns because importing both into one module forces aliasing (`import { Button as IconButton }`). If the warning surprises you, it is usually a copy-pasted file; rename one component. Does Arvia work without Vite? The compiler is a plain function — `compile(source, options)` from `@arviahq/compiler` returns `{ css, js, dts, diagnostics }` — so any bundler or build script can integrate it; the Vite plugin is ~300 lines you can mirror. First-party support is Vite-only today, and `arvia gen` covers type generation anywhere. Not answered here? The [diagnostics reference](/docs/diagnostics) explains every compiler message, and each language page documents its construct\'s edge cases.',
};

export function FaqPage() {
  return (
    <DocArticle meta={faqMeta}>
      <DocH2>
        <fbt desc="Docs content — heading: faq no styles">{"My styles don't apply at all"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: no styles">
          {
            'Almost always: the theme file was never imported. Importing a component file loads its CSS, but global rules and the `--arvia-*` token variables ship with the theme file itself — `import "./theme.arv";` once in your entry point. If a single component looks unstyled instead, check that you put `styles.root` (a string of class names) on the element, not the `styles` object.'
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: faq any">{"Imports from .arv are typed as any"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: any types">
          {
            'In the default central mode this means `.arvia/types` hasn\'t been generated yet, or `rootDirs` is missing. Generate the declarations (run `arvia gen src`, or start the dev server) and add `"rootDirs": ["src", ".arvia/types"]` to the tsconfig that includes `src`. If you chose `dts: false`, the editor needs the TypeScript plugin instead: in VS Code run “TypeScript: Select TypeScript Version” → workspace so `@arviahq/typescript-plugin` loads, and type-check with `arvia-tsc`. Full details in [Type checking](/docs/typecheck).'
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: faq theme not found">
          {"Unknown token errors in every file except the theme"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: theme not found">
          {
            "The shared theme isn't being picked up, so each file is checked against an empty environment. Set `arvia({ theme: \"src/theme.arv\" })` in the Vite config (or move the file to the conventional `src/theme.arv`). In monorepos remember the path is relative to each app's Vite root — every app config points at the theme, even a shared one."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: faq no component">
          {"Why is there no <Button> component?"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: no component">
          {
            "By design. Arvia generates styling functions, not UI components — you keep ownership of markup, refs, accessibility, and events, and the same `.arv` file serves React, Preact, Vue, or plain DOM. The pattern is a thin wrapper per framework; see [Components](/docs/components) for the canonical one."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: faq dynamic">
          {"How do I style with runtime values?"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: dynamic values">
          {
            "Arvia compiles ahead of time, so a value computed at runtime (a user-picked color, a measured width) cannot become a class. Use the platform's escape hatch: set an inline style or a CSS custom property, and keep everything static in the component. The `tokens` export helps mix the two worlds:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"ProgressBar.tsx"}
        code={`import { ProgressBar } from "./progress.arv";
import { tokens } from "./theme.arv";

const s = ProgressBar();

<div className={s.root}>
  <div
    className={s.fill}
    style={{ width: \`\${percent}%\`, background: accent ?? tokens.color.primary }}
  />
</div>`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: faq boolean">{"Why no boolean variants?"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: boolean variants">
          {
            'Two-value axes do the same job with better names: `state { idle {} invalid {} }` reads clearly in source and call site, and leaves room for a third state without an API break. Map your boolean at the call site: `state: invalid ? "invalid" : "idle"`. See [Variants & defaults](/docs/variants).'
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: faq moved file">
          {"My class names changed after I moved a file"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: moved file">
          {
            "Expected: the 6-character hash comes from the file's project-relative path plus the component name (see [How compilation works](/docs/compilation)). Renaming or moving a file gives its components new hashes. Nothing breaks — JS and CSS regenerate together — but don't persist generated class names anywhere (snapshots, analytics selectors); target stable attributes instead."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: faq cascade">
          {"A style overrides my component — or refuses to"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: cascade">
          {
            "Every generated class has the same single-class specificity, so stylesheet order decides ties. The order is deliberate: base → variants → responsive/container → compounds within a component, and standalone `style` declarations after all components (utilities last). If a utility must always win regardless of order, make it win on specificity explicitly — but first ask whether the property belongs in the component as a variant."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: faq collision">
          {"Two files export the same component name"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: collision">
          {
            "Allowed — hashes keep their CSS apart — and the Vite plugin warns because importing both into one module forces aliasing (`import { Button as IconButton }`). If the warning surprises you, it is usually a copy-pasted file; rename one component."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: faq without vite">{"Does Arvia work without Vite?"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — faq: without vite">
          {
            "The compiler is a plain function — `compile(source, options)` from `@arviahq/compiler` returns `{ css, js, dts, diagnostics }` — so any bundler or build script can integrate it; the Vite plugin is ~300 lines you can mirror. First-party support is Vite-only today, and `arvia gen` covers type generation anywhere."
          }
        </fbt>
      </DocP>
      <DocCallout tone="tip">
        <fbt desc="Docs note — faq: more help">
          {
            "Not answered here? The [diagnostics reference](/docs/diagnostics) explains every compiler message, and each language page documents its construct's edge cases."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
