import type { ReactNode } from "react";
import { lazy, Suspense } from "react";
import { fbt } from "fbtee";
import { Link as RouterLinkBase, useMatch } from "react-router-dom";
import { getDocNav } from "../docs/nav";
import {
  DocsSearchTrigger,
  isAlgoliaDocSearchEnabled,
} from "./DocsSearch";

const AlgoliaDocSearch = lazy(() =>
  import("./AlgoliaDocSearch").then((mod) => ({ default: mod.AlgoliaDocSearch })),
);
import { Badge } from "./badge.arv";
import { Button } from "./button.arv";
import { Code } from "./Code";
import { FeatureCard } from "./feature-card.arv";
import { Heading } from "./heading.arv";
import { HeroBackground } from "./HeroBackground";
import {
  DocsLayout,
  Grid,
  Hero,
  HeroShell,
  Page,
  Prose,
  SidebarSection,
  Stack,
} from "./layout.arv";
import { Link } from "./link.arv";
import { Nav } from "./nav.arv";
import { Text } from "./text.arv";
import type { SiteLocale, SiteTheme } from "../preferences";

function RouterLink(props: {
  to: string;
  tone?: "default" | "muted" | "accent";
  children: ReactNode;
}) {
  const match = useMatch({ path: props.to, end: true });
  const styles = Link({
    tone: props.tone ?? "default",
    active: match ? "yes" : "no",
  });
  return (
    <RouterLinkBase to={props.to} className={styles.root}>
      {props.children}
    </RouterLinkBase>
  );
}

const LOCALE_OPTIONS: { value: SiteLocale; label: string }[] = [
  { value: "en_US", label: "English" },
  { value: "fr_FR", label: "Français" },
  { value: "es_ES", label: "Español" },
  { value: "de_DE", label: "Deutsch" },
  { value: "pt_PT", label: "Português" },
];

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function SiteNav(props: {
  locale: SiteLocale;
  onLocaleChange: (locale: SiteLocale) => void;
  onThemeToggle: () => void;
  theme: SiteTheme;
}) {
  const nav = Nav();
  const navBtn = Button({ tone: "ghost", size: "sm" });
  const controlClass = `${navBtn.root} ${nav.control}`;
  const iconControlClass = `${controlClass} ${nav.controlIcon}`;

  return (
    <header className={nav.root}>
      <div className={nav.inner}>
        <RouterLink to="/">
          <span
            className={nav.brand}
            style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
          >
            <img src="/logo.svg" alt="" width={28} height={28} aria-hidden />
            Arvia
          </span>
        </RouterLink>
        <nav className={nav.links}>
          <RouterLink to="/docs/introduction" tone="muted">
            <fbt desc="Main navigation link to documentation">Docs</fbt>
          </RouterLink>
          <RouterLink to="/playground" tone="muted">
            <fbt desc="Main navigation link to playground">Playground</fbt>
          </RouterLink>
          <a
            href="https://github.com/Fausto95/arvia"
            className={Text({ size: "sm", tone: "muted" }).root}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
        <div className={nav.actions}>
          {isAlgoliaDocSearchEnabled() ? (
            <Suspense fallback={null}>
              <AlgoliaDocSearch />
            </Suspense>
          ) : (
            <DocsSearchTrigger variant="nav" />
          )}
          <select
            aria-label={fbt("Language", "Language selector aria label")}
            value={props.locale}
            onChange={(e) => props.onLocaleChange(e.target.value as SiteLocale)}
            className={controlClass}
            style={{ fontFamily: "inherit", cursor: "pointer" }}
          >
            {LOCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={iconControlClass}
            onClick={props.onThemeToggle}
            aria-label={
              props.theme === "dark"
                ? fbt("Switch to light mode", "Theme toggle — switch to light mode")
                : fbt("Switch to dark mode", "Theme toggle — switch to dark mode")
            }
          >
            {props.theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteHero() {
  const shell = HeroShell();
  const hero = Hero();
  return (
    <div className={shell.root}>
      <div className={shell.backdrop}>
        <HeroBackground />
      </div>
      <section className={shell.content + " " + hero.root}>
        <div className={hero.badge}>
          <span className={Badge({ tone: "accent" }).root}>
            <fbt desc="Hero badge highlighting product traits">zero runtime · fully typed</fbt>
          </span>
        </div>
        <h1 className={Heading({ level: "display" }).root + " " + hero.title}>
          <fbt desc="Hero headline first line">Design systems deserve</fbt>
          <br />
          <fbt desc="Hero headline second line">their own language.</fbt>
        </h1>
        <p className={hero.subtitle}>
          <fbt desc="Hero subtitle first line">
            Extend familiar CSS with first-class tokens, themes, variants, slots, and components.
          </fbt>
          <br />
          <fbt desc="Hero subtitle second line">
            Compile to optimized CSS, generated types, and typed component APIs — zero runtime
            overhead.
          </fbt>
        </p>
        <div className={hero.actions}>
          <RouterLinkBase to="/docs/quick-start" className={Button({ tone: "primary" }).root}>
            <fbt desc="Primary hero call to action">Get started</fbt>
          </RouterLinkBase>
          <RouterLinkBase to="/playground" className={Button({ tone: "surface" }).root}>
            <fbt desc="Secondary hero call to action">Try playground</fbt>
          </RouterLinkBase>
        </div>
        <p className={hero.frameworks}>
          <fbt desc="Label before supported framework links">Supported frameworks:</fbt>{" "}
          <RouterLinkBase to="/docs/installation" className={Link({ tone: "accent" }).root}>
            React
          </RouterLinkBase>
          {" · "}
          <RouterLinkBase to="/docs/installation" className={Link({ tone: "accent" }).root}>
            Preact
          </RouterLinkBase>
        </p>
      </section>
    </div>
  );
}

export function FeatureGrid() {
  const grid = Grid();
  const items = [
    {
      icon: "⚡",
      title: <fbt desc="Feature card title — zero runtime CSS">Zero runtime CSS</fbt>,
      body: (
        <fbt desc="Feature card body — compile-time styles">
          Styles compile at build time. No style recalculation in the browser.
        </fbt>
      ),
    },
    {
      icon: "🎯",
      title: <fbt desc="Feature card title — typed variants">Typed variants</fbt>,
      body: (
        <fbt desc="Feature card body — variant autocomplete">
          Autocomplete for every variant prop. Catch invalid combinations early.
        </fbt>
      ),
    },
    {
      icon: "🧩",
      title: <fbt desc="Feature card title — design tokens">Design tokens</fbt>,
      body: (
        <fbt desc="Feature card body — token system">
          Themes, modes, breakpoints, and container tokens — all first-class.
        </fbt>
      ),
    },
    {
      icon: "📦",
      title: <fbt desc="Feature card title — slots and recipes">Slots & recipes</fbt>,
      body: (
        <fbt desc="Feature card body — composition">
          Multi-part components and reusable style fragments with use.
        </fbt>
      ),
    },
    {
      icon: "📱",
      title: <fbt desc="Feature card title — responsive layout">Responsive & containers</fbt>,
      body: (
        <fbt desc="Feature card body — responsive variants">
          Breakpoint and container-query variants with object props.
        </fbt>
      ),
    },
    {
      icon: "🛠",
      title: <fbt desc="Feature card title — toolchain">Full toolchain</fbt>,
      body: (
        <fbt desc="Feature card body — developer tools">
          Vite plugin, LSP, Storybook generator, and token documentation.
        </fbt>
      ),
    },
  ];

  return (
    <div className={grid.root}>
      {items.map((item, i) => {
        const card = FeatureCard();
        return (
          <div key={i} className={card.root}>
            <span className={card.icon}>{item.icon}</span>
            <p className={card.title}>{item.title}</p>
            <p className={card.body}>{item.body}</p>
          </div>
        );
      })}
    </div>
  );
}

export function DocContent(props: {
  title: string;
  description: string;
  blocks: import("../docs/content").DocBlock[];
}) {
  return (
    <article style={{ width: "100%" }}>
      <header style={{ marginBottom: 32, maxWidth: "42rem" }}>
        <h1 className={Heading({ level: "h1" }).root}>{props.title}</h1>
        <p className={Text({ tone: "muted", size: "lg" }).root}>{props.description}</p>
      </header>
      {props.blocks.map((block, i) => {
        if (block.type === "code") {
          return (
            <Code key={i} label={block.label}>
              {block.code}
            </Code>
          );
        }
        const p = Prose();
        switch (block.type) {
          case "p":
            return (
              <p key={i} className={p.p}>
                {block.text}
              </p>
            );
          case "h2":
            return (
              <h2 key={i} className={p.h2}>
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className={p.h3}>
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className={p.ul}>
                {block.items.map((item) => (
                  <li key={item} className={p.li}>
                    {item}
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </article>
  );
}

export function DocsSidebar() {
  const docNav = getDocNav();
  return (
    <aside>
      {!isAlgoliaDocSearchEnabled() ? <DocsSearchTrigger variant="sidebar" /> : null}
      {docNav.map((group) => {
        const s = SidebarSection();
        return (
          <div key={group.section} className={s.root}>
            <p className={s.title}>{group.section}</p>
            <div className={s.links}>
              {group.items.map((item) => (
                <RouterLink key={item.slug} to={`/docs/${item.slug}`} tone="muted">
                  {item.title}
                </RouterLink>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}

export function DocsShell(props: { children: ReactNode }) {
  const layout = DocsLayout();
  return (
    <div className={layout.root}>
      <div className={layout.sidebar}>
        <DocsSidebar />
      </div>
      <main className={layout.content}>{props.children}</main>
    </div>
  );
}

export function ExampleCard(props: {
  title: string;
  description: string;
  arv: string;
  usage?: string;
}) {
  const stack = Stack({ gap: "3" });
  return (
    <div className={stack.root}>
      <div>
        <h3 className={Heading({ level: "h3" }).root}>{props.title}</h3>
        <p className={Text({ tone: "muted", size: "sm" }).root}>{props.description}</p>
      </div>
      <Code label=".arv">{props.arv}</Code>
      {props.usage ? <Code label="App.tsx">{props.usage}</Code> : null}
    </div>
  );
}

export { Code } from "./Code";
export { Page, Stack, Text, Heading, Button, Badge };
