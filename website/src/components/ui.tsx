import type { ReactNode } from "react";
import { Link as RouterLinkBase, useMatch } from "react-router-dom";
import { DOC_NAV } from "../docs/content";
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
  InlineCode,
  Page,
  Prose,
  SidebarSection,
  Stack,
} from "./layout.arv";
import { Link } from "./link.arv";
import { Nav } from "./nav.arv";
import { Text } from "./text.arv";

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

export function SiteNav(props: { onThemeToggle: () => void; themeLabel: string }) {
  const nav = Nav();
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
            Docs
          </RouterLink>
          <RouterLink to="/playground" tone="muted">
            Playground
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
          <button
            type="button"
            className={Button({ tone: "ghost", size: "sm" }).root}
            onClick={props.onThemeToggle}
          >
            {props.themeLabel}
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
          <span className={Badge({ tone: "accent" }).root}>zero runtime · fully typed</span>
        </div>
        <h1 className={Heading({ level: "display" }).root + " " + hero.title}>
          Design systems deserve
          <br />
          their own language.
        </h1>
        <p className={hero.subtitle}>
          Extend familiar CSS with first-class tokens, themes, variants, slots, and components.
          <br />
          Compile to optimized CSS, generated types, and typed component APIs — zero runtime
          overhead.
        </p>
        <div className={hero.actions}>
          <RouterLinkBase to="/docs/quick-start" className={Button({ tone: "primary" }).root}>
            Get started
          </RouterLinkBase>
          <RouterLinkBase to="/playground" className={Button({ tone: "surface" }).root}>
            Try playground
          </RouterLinkBase>
        </div>
      </section>
    </div>
  );
}

export function FeatureGrid() {
  const grid = Grid();
  const items = [
    {
      icon: "⚡",
      title: "Zero runtime CSS",
      body: "Styles compile at build time. No style recalculation in the browser.",
    },
    {
      icon: "🎯",
      title: "Typed variants",
      body: "Autocomplete for every variant prop. Catch invalid combinations early.",
    },
    {
      icon: "🧩",
      title: "Design tokens",
      body: "Themes, modes, breakpoints, and container tokens — all first-class.",
    },
    {
      icon: "📦",
      title: "Slots & recipes",
      body: "Multi-part components and reusable style fragments with use.",
    },
    {
      icon: "📱",
      title: "Responsive & containers",
      body: "Breakpoint and container-query variants with object props.",
    },
    {
      icon: "🛠",
      title: "Full toolchain",
      body: "Vite plugin, LSP, Storybook generator, and token documentation.",
    },
  ];

  return (
    <div className={grid.root}>
      {items.map((item) => {
        const card = FeatureCard();
        return (
          <div key={item.title} className={card.root}>
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
  return (
    <aside>
      {DOC_NAV.map((group) => {
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
export { Page, Stack, InlineCode, Text, Heading, Button, Badge };
