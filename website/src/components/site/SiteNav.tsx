import { Activity, lazy, Suspense } from "react";
import { Button } from "../button.arv";
import { Text } from "../text.arv";
import { Nav } from "../nav.arv";
import { DocsSearchTrigger, isAlgoliaDocSearchEnabled } from "../DocsSearch";
import type { SiteLocale, SiteTheme } from "../../preferences";
import { headingText } from "../../lib/render-prose";
import { RouterLink } from "./RouterLink";
import { SunIcon } from "./SunIcon";
import { MoonIcon } from "./MoonIcon";

const AlgoliaDocSearch = lazy(() =>
  import("../AlgoliaDocSearch").then((mod) => ({ default: mod.AlgoliaDocSearch })),
);

const LOCALE_OPTIONS: { value: SiteLocale; label: string }[] = [
  { value: "en_US", label: "English" },
  { value: "fr_FR", label: "Français" },
  { value: "es_ES", label: "Español" },
  { value: "de_DE", label: "Deutsch" },
  { value: "pt_PT", label: "Português" },
];

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
            <fbt desc="Main navigation link to documentation">{"Docs"}</fbt>
          </RouterLink>
          <RouterLink to="/playground" tone="muted">
            <fbt desc="Main navigation link to playground">{"Playground"}</fbt>
          </RouterLink>
          <a
            href="https://github.com/arviahq/arvia"
            className={Text({ size: "sm", tone: "muted" }).root}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
        <div className={nav.actions}>
          <Activity mode={isAlgoliaDocSearchEnabled() ? "visible" : "hidden"}>
            <Suspense fallback={null}>
              <AlgoliaDocSearch />
            </Suspense>
          </Activity>
          {!isAlgoliaDocSearchEnabled() ? <DocsSearchTrigger variant="nav" /> : null}
          <select
            aria-label={headingText(<fbt desc="Language selector aria label">{"Language"}</fbt>)}
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
                ? headingText(
                    <fbt desc="Theme toggle — switch to light mode">{"Switch to light mode"}</fbt>,
                  )
                : headingText(
                    <fbt desc="Theme toggle — switch to dark mode">{"Switch to dark mode"}</fbt>,
                  )
            }
          >
            {props.theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
