import type { ReactNode } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { fbt } from "fbtee";
import { Link as RouterLinkBase, useLocation, useMatch } from "react-router-dom";
import { getDocNav } from "../docs/nav";
import { DocsSearchTrigger, isAlgoliaDocSearchEnabled } from "./DocsSearch";

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
  Callout,
  DocsLayout,
  DocsMobileNav,
  DocTable,
  Grid,
  Hero,
  HeroShell,
  Page,
  Pager,
  Prose,
  SidebarSection,
  Stack,
  TocRail,
} from "./layout.arv";
import { headingId, renderInline } from "./inline";
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

function FeatureIcon(props: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {props.children}
    </svg>
  );
}

export function FeatureGrid() {
  const grid = Grid();
  const items = [
    {
      icon: (
        <FeatureIcon>
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — zero runtime CSS">Zero runtime CSS</fbt>,
      body: (
        <fbt desc="Feature card body — compile-time styles">
          Styles compile at build time. No style recalculation in the browser.
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — typed variants">Typed variants</fbt>,
      body: (
        <fbt desc="Feature card body — variant autocomplete">
          Autocomplete for every variant prop. Catch invalid combinations early.
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — design tokens">Design tokens</fbt>,
      body: (
        <fbt desc="Feature card body — token system">
          Themes, modes, breakpoints, and container tokens — all first-class.
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <path d="M12 2 2 7l10 5 10-5-10-5z" />
          <path d="M2 12l10 5 10-5" />
          <path d="M2 17l10 5 10-5" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — slots and recipes">Slots & recipes</fbt>,
      body: (
        <fbt desc="Feature card body — composition">
          Multi-part components and reusable style fragments with use.
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <rect x="2" y="4" width="13" height="10" rx="2" />
          <rect x="17" y="9" width="5" height="11" rx="1.5" />
          <path d="M6 18h5" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — responsive layout">Responsive & containers</fbt>,
      body: (
        <fbt desc="Feature card body — responsive variants">
          Breakpoint and container-query variants with object props.
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </FeatureIcon>
      ),
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
        if (block.type === "note") {
          const callout = Callout({ tone: block.tone });
          const labels = {
            info: fbt("Note", "Callout label — informational note"),
            warning: fbt("Warning", "Callout label — warning about a pitfall"),
            tip: fbt("Tip", "Callout label — pro tip"),
          };
          return (
            <aside key={i} className={callout.root}>
              <span className={callout.label}>{labels[block.tone]}</span>
              <span className={callout.body}>{renderInline(block.text)}</span>
            </aside>
          );
        }
        if (block.type === "table") {
          const t = DocTable();
          return (
            <div key={i} className={t.root}>
              <table className={t.table}>
                <thead>
                  <tr>
                    {block.headers.map((header, hi) => (
                      <th key={hi} className={t.th}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={t.td}>
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        const p = Prose();
        switch (block.type) {
          case "p":
            return (
              <p key={i} className={p.p}>
                {renderInline(block.text)}
              </p>
            );
          case "h2":
            return (
              <h2 key={i} id={headingId(block.text)} className={p.h2}>
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={headingId(block.text)} className={p.h3}>
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className={p.ul}>
                {block.items.map((item) => (
                  <li key={item} className={p.li}>
                    {renderInline(item)}
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

export type TocEntry = { id: string; text: string; level: 2 | 3 };

export function DocsToc(props: { entries: TocEntry[] }) {
  const rail = TocRail();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = props.entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (intersections) => {
        for (const entry of intersections) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            return;
          }
        }
      },
      // Treat the top quarter of the viewport as the "current section" band.
      { rootMargin: "0% 0% -75% 0%" },
    );
    for (const el of headings) observer.observe(el);
    return () => observer.disconnect();
  }, [props.entries]);

  if (props.entries.length === 0) return null;
  return (
    <nav className={rail.root} aria-label={fbt("On this page", "TOC aria label")}>
      <p className={rail.title}>
        <fbt desc="Docs table of contents title">On this page</fbt>
      </p>
      {props.entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          data-active={entry.id === activeId || undefined}
          className={entry.level === 3 ? `${rail.link} ${rail.sub}` : rail.link}
        >
          {entry.text}
        </a>
      ))}
    </nav>
  );
}

export function DocsPager(props: {
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}) {
  const pager = Pager();
  return (
    <div className={pager.root}>
      {props.prev ? (
        <RouterLinkBase className={pager.item} to={`/docs/${props.prev.slug}`}>
          <span className={pager.label}>
            <fbt desc="Pager previous label">Previous</fbt>
          </span>
          <span className={pager.title}>{props.prev.title}</span>
        </RouterLinkBase>
      ) : (
        <span />
      )}
      {props.next ? (
        <RouterLinkBase
          className={pager.item}
          to={`/docs/${props.next.slug}`}
          style={{ textAlign: "right" }}
        >
          <span className={pager.label}>
            <fbt desc="Pager next label">Next</fbt>
          </span>
          <span className={pager.title}>{props.next.title}</span>
        </RouterLinkBase>
      ) : (
        <span />
      )}
    </div>
  );
}

function DocsMobileNavView() {
  const nav = DocsMobileNav();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Navigating to another page closes the drawer.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className={nav.root} data-state={open ? "open" : "closed"}>
      <button
        type="button"
        className={nav.trigger}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={nav.chevron} aria-hidden>
          ▸
        </span>
        <fbt desc="Mobile docs navigation trigger">Browse docs</fbt>
      </button>
      <div className={nav.panel}>
        <DocsSidebar />
      </div>
    </div>
  );
}

export function DocsShell(props: { children: ReactNode; toc?: ReactNode }) {
  const layout = DocsLayout();
  return (
    <div className={layout.root}>
      <div className={layout.sidebar}>
        <DocsSidebar />
      </div>
      <main className={layout.content}>
        <DocsMobileNavView />
        {props.children}
      </main>
      <div className={layout.toc}>{props.toc}</div>
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
