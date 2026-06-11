import { fbt } from "fbtee";

export type DocSection = {
  title: string;
  slug: string;
  description: string;
  blocks: DocBlock[];
};

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; label?: string; code: string; lang?: string };

export function getDocs(): Record<string, DocSection> {
  return {
  introduction: {
    title: fbt("Introduction", "Docs page title — Introduction"),
    slug: "introduction",
    description: fbt("What Arvia is and how it fits in your stack.", "Docs page description — What Arvia is and how it fits in your stack."),
    blocks: [
      {
        type: "p",
        text: fbt("Arvia is a framework-agnostic design system compiler. You write .arv files that describe themes, tokens, recipes, and components — the compiler emits optimized CSS and typed TypeScript APIs with zero runtime styling cost. Use the generated APIs from React, Preact, or any JSX framework.", "Docs content — Arvia is a framework-agnostic design system comp…"),
      },
      {
        type: "p",
        text: fbt("Unlike CSS-in-JS, styles are resolved at build time. Unlike CSS Modules, you get first-class variants, slots, compound rules, and design tokens with full type safety.", "Docs content — Unlike CSS-in-JS, styles are resolved at build t…"),
      },
      {
        type: "code",
        label: "button.arv",
        code: `component Button {
  variants {
    size {
      sm { padding: 4px 12px; }
      lg { padding: 8px 20px; }
    }
    tone {
      primary { background: color.primary; }
    }
  }
  defaults { size: sm; tone: primary; }
}`,
      },
      {
        type: "code",
        label: "App.tsx",
        code: `import { Button } from "./button.arv";

const styles = Button({ size: "lg", tone: "primary" });
<button className={styles.root}>Save</button>`,
      },
    ],
  },

  installation: {
    title: fbt("Installation", "Docs page title — Installation"),
    slug: "installation",
    description: fbt("Add Arvia to a Vite project (React or Preact).", "Docs page description — Add Arvia to a Vite project (React or Preact)."),
    blocks: [
      {
        type: "h2",
        text: fbt("React", "Docs content — React"),
      },
      {
        type: "code",
        label: "terminal",
        code: `npm install -D @arviahq/vite-plugin-react`,
      },
      {
        type: "code",
        label: "vite.config.ts",
        code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    react(),
  ],
});`,
      },
      {
        type: "h2",
        text: fbt("Preact", "Docs content — Preact"),
      },
      {
        type: "code",
        label: "terminal",
        code: `npm install -D @arviahq/vite-plugin-preact @preact/preset-vite preact`,
      },
      {
        type: "code",
        label: "vite.config.ts",
        code: `import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { arvia } from "@arviahq/vite-plugin-preact";

export default defineConfig({
  plugins: [
    arvia({ theme: "src/theme.arv" }),
    preact(),
  ],
});`,
      },
      {
        type: "h2",
        text: fbt("TypeScript", "Docs content — TypeScript"),
      },
      {
        type: "code",
        label: "tsconfig.json",
        code: `{
  "compilerOptions": {
    "plugins": [{ "name": "@arviahq/typescript-plugin" }]
  }
}`,
      },
      {
        type: "p",
        text: fbt("Install the Arvia VS Code extension for syntax highlighting, diagnostics, completion, and hover docs on tokens.", "Docs content — Install the Arvia VS Code extension for syntax h…"),
      },
    ],
  },

  "quick-start": {
    title: fbt("Quick start", "Docs page title — Quick start"),
    slug: "quick-start",
    description: fbt("From zero to a styled button in minutes.", "Docs page description — From zero to a styled button in minutes."),
    blocks: [
      {
        type: "h2",
        text: fbt("1. Define tokens", "Docs content — 1. Define tokens"),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `theme {
  color {
    primary = #635bff;
    text = #111111;
  }
  space { 2 = 8px; 4 = 16px; }
  radius { md = 8px; }
}`,
      },
      {
        type: "h2",
        text: fbt("2. Import the theme", "Docs content — 2. Import the theme"),
      },
      {
        type: "code",
        label: "src/main.tsx",
        code: `import "./theme.arv"; // global CSS + variables`,
      },
      {
        type: "h2",
        text: fbt("3. Create a component", "Docs content — 3. Create a component"),
      },
      {
        type: "code",
        label: "src/button.arv",
        code: `component Button {
  base {
    padding: space.2 space.4;
    border-radius: radius.md;
    background: color.primary;
    color: white;
  }
}`,
      },
      {
        type: "h2",
        text: fbt("4. Use in your app", "Docs content — 4. Use in your app"),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `import { Button } from "./button.arv";

export function App() {
  const styles = Button();
  return <button className={styles.root}>Click me</button>;
}`,
      },
    ],
  },

  theme: {
    title: fbt("Theme & tokens", "Docs page title — Theme & tokens"),
    slug: "theme",
    description: fbt("Design tokens as the foundation of every style.", "Docs page description — Design tokens as the foundation of every style."),
    blocks: [
      {
        type: "p",
        text: fbt("A theme block defines named token groups. Reference tokens with dot notation: color.primary, space.4, radius.md.", "Docs content — A theme block defines named token groups. Refere…"),
      },
      {
        type: "code",
        code: `theme {
  color {
    primary = #635bff;
    danger = #e5484d;
  }
  space {
    1 = 4px;
    2 = 8px;
    4 = 16px;
  }
  radius { md = 8px; }
  font { sm = 13px; md = 15px; }
  duration { fast = 120ms; }
  easing { out = cubic-bezier(0.16, 1, 0.3, 1); }
  breakpoint { md = 768px; }
  container { wide = 480px; }
}`,
      },
      {
        type: "p",
        text: fbt("Tokens compile to CSS custom properties (--arvia-color-primary, etc.) when modes are enabled, or inline values in single-theme projects.", "Docs content — Tokens compile to CSS custom properties (--arvia…"),
      },
    ],
  },

  "theme-modes": {
    title: fbt("Theme modes", "Docs page title — Theme modes"),
    slug: "theme-modes",
    description: fbt("Light/dark themes with system preference and optional overrides.", "Docs page description — Light/dark themes with system preference and opt…"),
    blocks: [
      {
        type: "code",
        code: `theme {
  modes: light | dark;

  color {
    text = #111111;
    background = #ffffff;

    @dark {
      text = #eeeeee;
      background = #000000;
    }
  }
}`,
      },
      {
        type: "p",
        text: fbt("The first mode follows the OS color scheme via prefers-color-scheme. Set data-arvia-theme on <html> to override it.", "Docs content — The first mode follows the OS color scheme via p…"),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `function setTheme(mode: "light" | "dark") {
  document.documentElement.setAttribute("data-arvia-theme", mode);
}

<button onClick={() => setTheme("dark")}>Dark</button>`,
      },
    ],
  },

  global: {
    title: fbt("Global styles", "Docs page title — Global styles"),
    slug: "global",
    description: fbt("Resets, typography, and document-level rules.", "Docs page description — Resets, typography, and document-level rules."),
    blocks: [
      {
        type: "code",
        code: `global {
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: color.background;
    color: color.text;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
    }
  }
}`,
      },
      {
        type: "p",
        text: fbt("Import your theme file once (e.g. in main.tsx) to ship global rules alongside token variables.", "Docs content — Import your theme file once (e.g. in main.tsx) t…"),
      },
    ],
  },

  recipes: {
    title: fbt("Recipes", "Docs page title — Recipes"),
    slug: "recipes",
    description: fbt("Reusable style fragments composed with use.", "Docs page description — Reusable style fragments composed with use."),
    blocks: [
      {
        type: "code",
        code: `recipe Rounded {
  border-radius: 8px;
}

recipe Surface {
  use Rounded;
  border: 1px solid #e5e5e5;
  background: white;
}

component Card {
  use Surface;
  padding: 16px;
}`,
      },
      {
        type: "p",
        text: fbt("Recipes can include pseudo-states and nest other recipes. They never generate standalone APIs — only components do.", "Docs content — Recipes can include pseudo-states and nest other…"),
      },
    ],
  },

  components: {
    title: fbt("Components", "Docs page title — Components"),
    slug: "components",
    description: fbt("Slots, base styles, and typed component APIs.", "Docs page description — Slots, base styles, and typed component APIs."),
    blocks: [
      {
        type: "code",
        code: `component Button {
  base {
    display: inline-flex;
    gap: space.2;
    icon { flex-shrink: 0; }
  }

  slots {
    root {}
    icon {}
    label { font-weight: 500; }
  }
}`,
      },
      {
        type: "p",
        text: fbt("Bare declarations at the top level map to the implicit root slot. Named slot blocks style child elements.", "Docs content — Bare declarations at the top level map to the im…"),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `const s = Button();
<button className={s.root}>
  <span className={s.icon}>★</span>
  <span className={s.label}>Save</span>
</button>`,
      },
    ],
  },

  slots: {
    title: fbt("Slots", "Docs page title — Slots"),
    slug: "slots",
    description: fbt("Named parts of a multi-element component, each with its own class.", "Docs page description — Named parts of a multi-element component, each w…"),
    blocks: [
      {
        type: "code",
        code: `component Button {
  slots {
    root {}
    icon { flex-shrink: 0; }
    label { font-weight: 500; }
  }
}`,
      },
      {
        type: "p",
        text: fbt("The slots block declares a component's named parts. Declarations inside a slot are its base styles. Every component has a root slot — bare declarations at the top level or in base style it, so components without a slots block still export root.", "Docs content — The slots block declares a component's named par…"),
      },
      {
        type: "h2",
        text: fbt("Styling slots from anywhere", "Docs content — Styling slots from anywhere"),
      },
      {
        type: "code",
        code: `component Button {
  slots { root {} icon {} }

  base {
    display: inline-flex;
    gap: space.2;
    icon { flex-shrink: 0; }

    &:hover {
      icon { transform: translateX(3px); }
    }
  }

  variants {
    size {
      lg {
        font-size: font.lg;
        icon { transform: scale(1.2); }
      }
    }
  }
}`,
      },
      {
        type: "p",
        text: fbt("A nested slot block inside base, a variant value, a compound rule, or an &-state targets that slot when the surrounding condition applies — here the icon shifts on hover of the root and scales up for size: lg.", "Docs content — A nested slot block inside base, a variant value…"),
      },
      {
        type: "h2",
        text: fbt("Using slots in JSX", "Docs content — Using slots in JSX"),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `const styles = Button({ size: "lg" });

<button className={styles.root}>
  <span className={styles.icon}>★</span>
  <span className={styles.label}>Save</span>
</button>`,
      },
      {
        type: "p",
        text: fbt("The component function returns one class per slot, with variant and compound classes already merged in. The generated types know every slot name, so styles.icno is a compile error.", "Docs content — The component function returns one class per slo…"),
      },
    ],
  },

  variants: {
    title: fbt("Variants & defaults", "Docs page title — Variants & defaults"),
    slug: "variants",
    description: fbt("Prop-driven style branches with defaults.", "Docs page description — Prop-driven style branches with defaults."),
    blocks: [
      {
        type: "code",
        code: `component Button {
  variants {
    size {
      sm { font-size: 12px; }
      lg { font-size: 16px; }
    }
    tone {
      primary { background: color.primary; }
      danger { background: color.danger; }
    }
  }

  defaults {
    size: sm;
    tone: primary;
  }
}`,
      },
      {
        type: "code",
        label: "TypeScript",
        code: `Button({ size: "lg" }); // tone defaults to "primary"`,
      },
    ],
  },

  compound: {
    title: fbt("Compound variants", "Docs page title — Compound variants"),
    slug: "compound",
    description: fbt("Styles that apply when multiple variants match.", "Docs page description — Styles that apply when multiple variants match."),
    blocks: [
      {
        type: "code",
        code: `compound {
  size: sm;
  tone: danger;

  root {
    font-weight: 700;
    text-transform: uppercase;
  }
}`,
      },
      {
        type: "p",
        text: fbt("Compound blocks target a slot and only emit when every listed variant matches the current props.", "Docs content — Compound blocks target a slot and only emit when…"),
      },
    ],
  },

  states: {
    title: fbt("States", "Docs page title — States"),
    slug: "states",
    description: fbt("Pseudo-classes, combinators, and group hover.", "Docs page description — Pseudo-classes, combinators, and group hover."),
    blocks: [
      {
        type: "code",
        code: `base {
  background: color.primary;

  &:hover, &:focus-visible {
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::after {
    content: "";
  }
}`,
      },
      {
        type: "p",
        text: fbt("Selector lists expand per part. Whitespace after & is significant: `& .child` styles descendants and `& > svg` direct children, while `&.active` stays a compound on the same element.", "Docs content — Selector lists expand per part. Whitespace after…"),
      },
      {
        type: "h3",
        text: fbt("Group hover", "Docs content — Group hover"),
      },
      {
        type: "p",
        text: fbt("A slot block inside a state styles that slot when the owner matches — the classic icon-reacts-to-button-hover pattern:", "Docs content — A slot block inside a state styles that slot whe…"),
      },
      {
        type: "code",
        code: `component Button {
  slots { root {} icon {} }

  base {
    &:hover {
      icon { transform: translateX(2px); }
    }
  }
}`,
      },
      {
        type: "p",
        text: fbt("Compiles to .Button_root:hover .Button_icon { … }. Works from variant bodies too; the target always matches the slot's base class.", "Docs content — Compiles to .Button_root:hover .Button_icon { … …"),
      },
    ],
  },

  responsive: {
    title: fbt("Responsive", "Docs page title — Responsive"),
    slug: "responsive",
    description: fbt("Breakpoint-driven variant overrides.", "Docs page description — Breakpoint-driven variant overrides."),
    blocks: [
      {
        type: "code",
        code: `theme {
  breakpoint { md = 768px; }
}

component Button {
  variants {
    size {
      sm { padding: 4px; }
      lg { padding: 16px; }
    }
  }

  responsive {
    md { size: lg; }
  }
}`,
      },
      {
        type: "p",
        text: fbt("Override variants per breakpoint from your app with object props:", "Docs content — Override variants per breakpoint from your app w…"),
      },
      {
        type: "code",
        code: `Button({ size: { initial: "sm", md: "lg" } });`,
      },
    ],
  },

  "container-queries": {
    title: fbt("Container queries", "Docs page title — Container queries"),
    slug: "container-queries",
    description: fbt("Layout that responds to container width, not viewport.", "Docs page description — Layout that responds to container width, not vie…"),
    blocks: [
      {
        type: "code",
        code: `theme {
  container { wide = 480px; }
}

component Card {
  variants {
    layout {
      stacked { flex-direction: column; }
      row { flex-direction: row; }
    }
  }

  container {
    wide { layout: row; }
  }
}`,
      },
      {
        type: "p",
        text: fbt("Container props use a $ prefix. The root slot gets container-type: inline-size automatically.", "Docs content — Container props use a $ prefix. The root slot ge…"),
      },
      {
        type: "code",
        code: `Card({ layout: { initial: "stacked", $wide: "row" } });`,
      },
    ],
  },

  styles: {
    title: fbt("Styles", "Docs page title — Styles"),
    slug: "styles",
    description: fbt("Standalone exported classes — no component ceremony.", "Docs page description — Standalone exported classes — no component cerem…"),
    blocks: [
      {
        type: "p",
        text: fbt("Not everything is a component. A style declaration compiles to a single hashed class and exports it as a plain string constant — ideal for one-off utilities, layout helpers, and page-level styles.", "Docs content — Not everything is a component. A style declarati…"),
      },
      {
        type: "code",
        label: "utils.arv",
        code: `style truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

style panel {
  use Surface;
  padding: space.4;
  &:hover { border-color: color.primary; }
}`,
      },
      {
        type: "code",
        label: "App.tsx",
        code: `import { truncate, panel } from "./utils.arv";

<div className={panel}>
  <p className={truncate}>Long text…</p>
</div>;`,
      },
      {
        type: "p",
        text: fbt("Styles support declarations, use, and &-states — but no slots or variants. When a style grows variants, graduate it to a component. Styles are emitted after components in the CSS, so a composed style wins the cascade.", "Docs content — Styles support declarations, use, and &-states —…"),
      },
    ],
  },

  "local-tokens": {
    title: fbt("Local tokens", "Docs page title — Local tokens"),
    slug: "local-tokens",
    description: fbt("Component-scoped tokens that shadow the theme.", "Docs page description — Component-scoped tokens that shadow the theme."),
    blocks: [
      {
        type: "p",
        text: fbt("A tokens block inside a component declares values visible only to that component. Lookups check component tokens first, then the file and shared theme — same group.name syntax, no new reference style.", "Docs content — A tokens block inside a component declares value…"),
      },
      {
        type: "code",
        label: "chip.arv",
        code: `component Chip {
  tokens {
    space { pad = 6px; }
    metrics { radius = 999px; }
  }

  base {
    padding: space.pad space.2;   // local pad, theme space.2
    border-radius: metrics.radius;
  }
}`,
      },
      {
        type: "p",
        text: fbt("Local tokens are compile-time constants: they inline to literals even when theme modes are active, never become CSS variables, and never leak into other components, exports, or the token catalog. Mode overrides (@dark) are not allowed inside component tokens — moded values belong in the theme.", "Docs content — Local tokens are compile-time constants: they in…"),
      },
    ],
  },

  keyframes: {
    title: fbt("Keyframes", "Docs page title — Keyframes"),
    slug: "keyframes",
    description: fbt("Named animations referenced from components.", "Docs page description — Named animations referenced from components."),
    blocks: [
      {
        type: "code",
        code: `theme {
  duration { fast = 120ms; }
}

keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

component Box {
  base {
    animation: keyframes.fadeIn duration.fast;
  }
}`,
      },
    ],
  },

  "token-docs": {
    title: fbt("Token docs", "Docs page title — Token docs"),
    slug: "token-docs",
    description: fbt("Document tokens for designers and developers.", "Docs page description — Document tokens for designers and developers."),
    blocks: [
      {
        type: "code",
        code: `color {
  primary = #635bff doc "Brand primary — CTAs and links";
  danger = #e5484d doc "Destructive actions";
}`,
      },
      {
        type: "p",
        text: fbt("Doc strings appear in LSP hover and in generated token catalogs via arvia gen --docs.", "Docs content — Doc strings appear in LSP hover and in generated…"),
      },
    ],
  },

  packages: {
    title: fbt("Packages", "Docs page title — Packages"),
    slug: "packages",
    description: fbt("npm packages under @arviahq.", "Docs page description — npm packages under @arviahq."),
    blocks: [
      {
        type: "p",
        text: fbt("Install @arviahq/vite-plugin-react for React + Vite projects, or @arviahq/vite-plugin-preact for Preact + Vite. The compiler and TypeScript plugin are framework-agnostic — future @arviahq/vite-plugin-vue will reuse them.", "Docs content — Install @arviahq/vite-plugin-react for React + V…"),
      },
      {
        type: "ul",
        items: [
          fbt("@arviahq/vite-plugin-react — React + Vite (Vite plugin + arvia CLI)", "Docs list item — @arviahq/vite-plugin-react — React + Vite (Vite …"),
          fbt("@arviahq/vite-plugin-preact — Preact + Vite (Vite plugin + arvia CLI)", "Docs list item — @arviahq/vite-plugin-preact — Preact + Vite (Vit…"),
          fbt("@arviahq/typescript-plugin — tsconfig plugin + arvia-tsc", "Docs list item — @arviahq/typescript-plugin — tsconfig plugin + a…"),
          fbt("@arviahq/compiler — lexer, parser, checker, code generation", "Docs list item — @arviahq/compiler — lexer, parser, checker, code…"),
          fbt("@arviahq/vite-plugin — framework-agnostic Vite integration", "Docs list item — @arviahq/vite-plugin — framework-agnostic Vite i…"),
          fbt("@arviahq/language-server — LSP for editors", "Docs list item — @arviahq/language-server — LSP for editors"),
        ],
      },
    ],
  },

  "vite-plugin": {
    title: fbt("Vite plugin", "Docs page title — Vite plugin"),
    slug: "vite-plugin",
    description: fbt("Compile .arv files at build time with HMR.", "Docs page description — Compile .arv files at build time with HMR."),
    blocks: [
      {
        type: "p",
        text: fbt("The Arvia compiler integration is the same for every framework — only the JSX plugin in your Vite config differs.", "Docs content — The Arvia compiler integration is the same for e…"),
      },
      {
        type: "h2",
        text: fbt("React", "Docs content — React"),
      },
      {
        type: "code",
        label: "vite.config.ts",
        code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [
    arvia({
      theme: "src/theme.arv", // shared theme for all .arv files
      dts: false,              // optional: emit .d.ts siblings
    }),
    react(),
  ],
});`,
      },
      {
        type: "h2",
        text: fbt("Preact", "Docs content — Preact"),
      },
      {
        type: "code",
        label: "vite.config.ts",
        code: `import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { arvia } from "@arviahq/vite-plugin-preact";

export default defineConfig({
  plugins: [
    arvia({
      theme: "src/theme.arv",
      dts: false,
    }),
    preact(),
  ],
});`,
      },
      {
        type: "ul",
        items: [
          fbt("Compiles each .arv import to JS + extracted CSS", "Docs list item — Compiles each .arv import to JS + extracted CSS"),
          fbt("Theme edits trigger full reload; style-only edits hot-swap CSS", "Docs list item — Theme edits trigger full reload; style-only edit…"),
          fbt("Phantom .arv.css modules integrate with Vite's CSS pipeline", "Docs list item — Phantom .arv.css modules integrate with Vite's C…"),
        ],
      },
    ],
  },

  cli: {
    title: fbt("CLI", "Docs page title — CLI"),
    slug: "cli",
    description: fbt("Generate types and docs without running Vite.", "Docs page description — Generate types and docs without running Vite."),
    blocks: [
      {
        type: "code",
        code: `# Emit .d.ts for every .arv file
arvia gen src/

# Generate design token catalog
arvia gen --docs --theme src/theme.arv --out docs/tokens

# Generate Storybook stories from variants
arvia gen --storybook --theme src/theme.arv --out stories src/`,
      },
    ],
  },

  "language-server": {
    title: fbt("Language server", "Docs page title — Language server"),
    slug: "language-server",
    description: fbt("Editor intelligence for .arv files.", "Docs page description — Editor intelligence for .arv files."),
    blocks: [
      {
        type: "ul",
        items: [
          fbt("Diagnostics for syntax and type errors", "Docs list item — Diagnostics for syntax and type errors"),
          fbt("Completion for tokens, variants, and keywords", "Docs list item — Completion for tokens, variants, and keywords"),
          fbt("Hover showing token values and doc strings", "Docs list item — Hover showing token values and doc strings"),
          fbt("VS Code extension starts the server automatically", "Docs list item — VS Code extension starts the server automaticall…"),
        ],
      },
      {
        type: "p",
        text: fbt("TypeScript variant props are provided by @arviahq/typescript-plugin as virtual module declarations — no .d.ts files on disk required during development.", "Docs content — TypeScript variant props are provided by @arviah…"),
      },
    ],
  },

  storybook: {
    title: fbt("Storybook", "Docs page title — Storybook"),
    slug: "storybook",
    description: fbt("Auto-generate stories from component variants.", "Docs page description — Auto-generate stories from component variants."),
    blocks: [
      {
        type: "code",
        code: `arvia gen --storybook --theme src/theme.arv --out stories src/`,
      },
      {
        type: "p",
        text: fbt("The generator reads variants, defaults, and slots to produce CSF stories. Run pnpm demo:storybook in the monorepo to see it in action.", "Docs content — The generator reads variants, defaults, and slot…"),
      },
    ],
  },
  };
}


export type Example = {
  id: string;
  title: string;
  description: string;
  arv: string;
  usage?: string;
};

export function getExamples(): Example[] {
  return [
  {
    id: "tokens",
    title: fbt("Theme tokens", "Docs page title — Theme tokens"),
    description: fbt("Named design tokens in groups.", "Docs page description — Named design tokens in groups."),
    arv: `theme {
  color { primary = #635bff; }
  space { 2 = 8px; 4 = 16px; }
}`,
  },
  {
    id: "modes",
    title: fbt("Theme modes", "Docs page title — Theme modes"),
    description: fbt("Light and dark with @dark overrides.", "Docs page description — Light and dark with @dark overrides."),
    arv: `theme {
  modes: light | dark;
  color {
    text = #111;
    @dark { text = #eee; }
  }
}`,
  },
  {
    id: "doc-strings",
    title: fbt("Token docs", "Docs page title — Token docs"),
    description: fbt("doc metadata on tokens.", "Docs page description — doc metadata on tokens."),
    arv: `color {
  primary = #635bff doc "Brand primary";
}`,
  },
  {
    id: "global",
    title: fbt("Global styles", "Docs page title — Global styles"),
    description: fbt("Document-level rules.", "Docs page description — Document-level rules."),
    arv: `global {
  body { margin: 0; color: color.text; }
}`,
  },
  {
    id: "recipe",
    title: fbt("Recipes", "Docs page title — Recipes"),
    description: fbt("Composable style fragments.", "Docs page description — Composable style fragments."),
    arv: `recipe Surface {
  border: 1px solid #e5e5e5;
  background: white;
}`,
  },
  {
    id: "implicit-root",
    title: fbt("Implicit root", "Docs page title — Implicit root"),
    description: fbt("Top-level declarations become root styles.", "Docs page description — Top-level declarations become root styles."),
    arv: `component Badge {
  padding: 2px 8px;
  border-radius: 999px;
}`,
  },
  {
    id: "slots",
    title: fbt("Slots", "Docs page title — Slots"),
    description: fbt("Named parts of a component.", "Docs page description — Named parts of a component."),
    arv: `component Button {
  slots {
    root {}
    icon { flex-shrink: 0; }
  }
}`,
  },
  {
    id: "variants",
    title: fbt("Variants", "Docs page title — Variants"),
    description: fbt("Prop-driven style branches.", "Docs page description — Prop-driven style branches."),
    arv: `variants {
  tone {
    primary { background: color.primary; }
    danger { background: color.danger; }
  }
}`,
  },
  {
    id: "compound",
    title: fbt("Compound variants", "Docs page title — Compound variants"),
    description: fbt("Multi-variant rules.", "Docs page description — Multi-variant rules."),
    arv: `compound {
  size: sm;
  tone: danger;
  root { font-weight: 700; }
}`,
  },
  {
    id: "states",
    title: fbt("States", "Docs page title — States"),
    description: fbt("Pseudo-class styles.", "Docs page description — Pseudo-class styles."),
    arv: `&:hover { filter: brightness(1.05); }
&:focus-visible { outline: 2px solid color.primary; }`,
  },
  {
    id: "responsive",
    title: fbt("Responsive", "Docs page title — Responsive"),
    description: fbt("Breakpoint overrides.", "Docs page description — Breakpoint overrides."),
    arv: `responsive {
  md { size: lg; }
}`,
    usage: `Button({ size: { initial: "sm", md: "lg" } });`,
  },
  {
    id: "container",
    title: fbt("Container queries", "Docs page title — Container queries"),
    description: fbt("Container-width layout.", "Docs page description — Container-width layout."),
    arv: `container {
  wide { layout: row; }
}`,
    usage: `Card({ layout: { initial: "stacked", $wide: "row" } });`,
  },
  {
    id: "keyframes",
    title: fbt("Keyframes", "Docs page title — Keyframes"),
    description: fbt("Named animations.", "Docs page description — Named animations."),
    arv: `keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
  },
  {
    id: "styles",
    title: fbt("Styles", "Docs page title — Styles"),
    description: fbt("Exported one-class utilities.", "Docs page description — Exported one-class utilities."),
    arv: `style truncate {
  overflow: hidden;
  text-overflow: ellipsis;
}`,
    usage: `import { truncate } from "./utils.arv";

<p className={truncate}>Long text…</p>;`,
  },
  {
    id: "local-tokens",
    title: fbt("Local tokens", "Docs page title — Local tokens"),
    description: fbt("Component-scoped values.", "Docs page description — Component-scoped values."),
    arv: `component Chip {
  tokens { space { pad = 6px; } }
  base { padding: space.pad; }
}`,
  },
  ];
}
