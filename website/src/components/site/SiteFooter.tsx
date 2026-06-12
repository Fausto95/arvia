import { Link } from "@tanstack/react-router";
import { appLink } from "../../lib/router-links";
import { Footer } from "../footer.arv";

const REPO_URL = "https://github.com/arviahq/arvia";

export function SiteFooter() {
  const footer = Footer();
  const docsLinks = [
    {
      to: "/docs/introduction",
      label: <fbt desc="Footer link — introduction">{"Introduction"}</fbt>,
    },
    { to: "/docs/quick-start", label: <fbt desc="Footer link — quick start">{"Quick start"}</fbt> },
    {
      to: "/docs/thinking-in-arvia",
      label: <fbt desc="Footer link — thinking">{"Thinking in Arvia"}</fbt>,
    },
    { to: "/docs/faq", label: <fbt desc="Footer link — faq">{"FAQ & troubleshooting"}</fbt> },
  ];
  const referenceLinks = [
    {
      to: "/docs/compilation",
      label: <fbt desc="Footer link — compilation">{"How compilation works"}</fbt>,
    },
    {
      to: "/docs/diagnostics",
      label: <fbt desc="Footer link — diagnostics">{"Diagnostics reference"}</fbt>,
    },
    { to: "/docs/patterns", label: <fbt desc="Footer link — patterns">{"Advanced patterns"}</fbt> },
    {
      to: "/docs/from-tailwind",
      label: <fbt desc="Footer link — migration">{"Migration guides"}</fbt>,
    },
  ];
  const ecosystemLinks = [
    { href: REPO_URL, label: "GitHub" },
    {
      href: "https://www.npmjs.com/org/arviahq",
      label: <fbt desc="Footer link — npm">{"npm packages"}</fbt>,
    },
    {
      href: `${REPO_URL}/tree/main/packages/vscode-extension`,
      label: <fbt desc="Footer link — vscode">{"VS Code extension"}</fbt>,
    },
  ];

  return (
    <footer className={footer.root}>
      <div className={footer.inner}>
        <div className={footer.grid}>
          <div className={footer.brand}>
            <span className={footer.brandRow}>
              <img src="/logo.svg" alt="" width={24} height={24} aria-hidden />
              Arvia
            </span>
            <p className={footer.tagline}>
              <fbt desc="Footer tagline">
                {
                  "The design system compiler for the web. Write .arv files, ship plain CSS and typed\n                APIs."
                }
              </fbt>
            </p>
          </div>
          <div>
            <p className={footer.colTitle}>
              <fbt desc="Footer column title — docs">{"Docs"}</fbt>
            </p>
            <div className={footer.col}>
              {docsLinks.map((item) => (
                <Link key={item.to} {...appLink(item.to)} className={footer.link}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className={footer.colTitle}>
              <fbt desc="Footer column title — reference">{"Reference"}</fbt>
            </p>
            <div className={footer.col}>
              {referenceLinks.map((item) => (
                <Link key={item.to} {...appLink(item.to)} className={footer.link}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className={footer.colTitle}>
              <fbt desc="Footer column title — ecosystem">{"Ecosystem"}</fbt>
            </p>
            <div className={footer.col}>
              <Link {...appLink("/playground")} className={footer.link}>
                <fbt desc="Footer link — playground">{"Playground"}</fbt>
              </Link>
              {ecosystemLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={footer.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className={footer.bottom}>
          <p className={footer.note}>
            <fbt desc="Footer note — built with">
              {"This site is built entirely with React and"}
            </fbt>{" "}
            <a
              href={`${REPO_URL}/tree/main/website/src/components`}
              className={footer.noteAccent}
              target="_blank"
              rel="noreferrer"
            >
              Arvia
            </a>{" "}
            <fbt desc="Footer note — built with, second part">
              {"— every component you see is compiled from .arv files."}
            </fbt>
          </p>
          <p className={footer.note}>
            <fbt desc="Footer license note">{"MIT licensed"}</fbt>
          </p>
        </div>
      </div>
    </footer>
  );
}
