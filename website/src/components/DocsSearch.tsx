import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { fbt } from "fbtee";
import { useNavigate } from "react-router-dom";
import { Button } from "./button.arv";
import { DocsSearch as DocsSearchStyles } from "./docs-search.arv";
import { searchDocs } from "../docs/search-index";

export function isAlgoliaDocSearchEnabled(): boolean {
  return Boolean(
    import.meta.env.VITE_DOCSEARCH_APP_ID &&
      import.meta.env.VITE_DOCSEARCH_API_KEY &&
      import.meta.env.VITE_DOCSEARCH_INDEX_NAME,
  );
}

type DocsSearchContextValue = {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
};

const DocsSearchContext = createContext<DocsSearchContextValue | null>(null);

function useDocsSearchContext(): DocsSearchContextValue {
  const value = useContext(DocsSearchContext);
  if (!value) {
    throw new Error("DocsSearch components must be used within DocsSearchProvider");
  }
  return value;
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function shortcutLabel(): string {
  if (typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)) {
    return "⌘K";
  }
  return "Ctrl+K";
}

export function DocsSearchTrigger(props: { variant: "nav" | "sidebar" }) {
  const { openSearch } = useDocsSearchContext();
  const styles = DocsSearchStyles({ placement: props.variant });
  const btn = Button({ tone: "ghost", size: "sm" });

  return (
    <button
      type="button"
      className={`${btn.root} ${styles.trigger}`}
      onClick={openSearch}
      aria-label={fbt("Search documentation", "Open docs search dialog")}
    >
      <SearchIcon />
      <span>{fbt("Search", "Docs search trigger label")}</span>
      <kbd className={styles.kbd}>{shortcutLabel()}</kbd>
    </button>
  );
}

function DocsSearchDialog() {
  const { open, closeSearch } = useDocsSearchContext();
  const navigate = useNavigate();
  const styles = DocsSearchStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => searchDocs(query), [query]);

  const goTo = useCallback(
    (slug: string) => {
      closeSearch();
      navigate(`/docs/${slug}`);
    },
    [closeSearch, navigate],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      goTo(results[activeIndex].slug);
    }
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeSearch();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Search documentation">
        <div className={styles.field}>
          <span className={styles.icon}>
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={fbt("Search documentation…", "Docs search input placeholder")}
            aria-autocomplete="list"
            aria-controls="docs-search-results"
          />
          <span className={styles.hint}>
            <kbd className={styles.kbd}>esc</kbd>
          </span>
        </div>
        {query.trim() ? (
          results.length > 0 ? (
            <ul id="docs-search-results" className={styles.list} role="listbox">
              {results.map((result, index) => (
                <li key={result.slug} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    className={`${styles.item}${index === activeIndex ? ` ${styles.itemActive}` : ""}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goTo(result.slug)}
                  >
                    <p className={styles.itemTitle}>{result.title}</p>
                    <p className={styles.itemSnippet}>{result.excerpt || result.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              <fbt desc="Docs search empty state">
                No results for <fbt:param name="query">{query}</fbt:param>
              </fbt>
            </p>
          )
        ) : (
          <p className={styles.empty}>
            {fbt("Type to search docs", "Docs search idle hint")}
          </p>
        )}
      </div>
    </div>
  );
}

export function DocsSearchProvider(props: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const useAlgolia = isAlgoliaDocSearchEnabled();

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (useAlgolia) return;

    function onKeyDown(event: globalThis.KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [useAlgolia]);

  const value = useMemo(
    () => ({ open, openSearch, closeSearch }),
    [open, openSearch, closeSearch],
  );

  return (
    <DocsSearchContext.Provider value={value}>
      {props.children}
      {!useAlgolia ? <DocsSearchDialog /> : null}
    </DocsSearchContext.Provider>
  );
}
