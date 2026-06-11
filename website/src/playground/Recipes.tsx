import { useEffect, useState } from "react";
import { Code } from "../components/Code";
import { Heading, Text } from "../components/ui";
import { PlaygroundSplit } from "./playground-layout.arv";
import { RecipePreview } from "./RecipePreview";
import { RECIPES } from "./recipes/index";

export function Recipes() {
  const [activeId, setActiveId] = useState(RECIPES[0]?.id ?? "tokens");

  useEffect(() => {
    function onScroll() {
      for (const recipe of RECIPES.toReversed()) {
        const el = document.getElementById(`recipe-${recipe.id}`);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          setActiveId(recipe.id);
          break;
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(`recipe-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 32,
        alignItems: "start",
      }}
    >
      <nav
        style={{
          position: "sticky",
          top: 80,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {RECIPES.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            onClick={() => scrollTo(recipe.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background:
                activeId === recipe.id ? "var(--arvia-color-surfaceRaised)" : "transparent",
              color:
                activeId === recipe.id ? "var(--arvia-color-text)" : "var(--arvia-color-muted)",
              fontWeight: activeId === recipe.id ? 500 : 400,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {recipe.title}
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", flexDirection: "column", gap: 48, minWidth: 0 }}>
        {RECIPES.map((recipe) => {
          const split = PlaygroundSplit({ layout: "stack" });
          return (
            <section key={recipe.id} id={`recipe-${recipe.id}`} style={{ scrollMarginTop: 80 }}>
              <h3 className={Heading({ level: "h3" }).root} style={{ marginBottom: 8 }}>
                {recipe.title}
              </h3>
              <p className={Text({ size: "sm", tone: "muted" }).root} style={{ marginBottom: 16 }}>
                recipes/{recipe.file}
              </p>
              <div className={split.root} style={{ minWidth: 0 }}>
                <Code label=".arv" lang="arv">
                  {recipe.source}
                </Code>
                <div
                  style={{
                    border: "1px solid var(--arvia-color-border)",
                    borderRadius: 12,
                    padding: 24,
                    background: "var(--arvia-color-surface)",
                  }}
                >
                  <RecipePreview id={recipe.id} />
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
