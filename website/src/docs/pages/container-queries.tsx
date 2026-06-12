import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const container_queriesMeta: DocPageMeta = {
  slug: "container-queries",
  title: <fbt desc="Docs page title — Container queries">{"Container queries"}</fbt>,
  description: (
    <fbt desc="Docs page description — Layout responding to container width.">
      {"Components that adapt to their own width, not the viewport's."}
    </fbt>
  ),
  nav: { section: "language", order: 17 },
  searchText:
    'A breakpoint answers the wrong question for reusable components: a card needs to know how wide it is, not how wide the screen is — the same card may render in a 300px sidebar and a 900px main column on one page. Container blocks switch variants based on the component\'s own rendered width: src/theme.arv theme {\n  container {\n    wide = 480px;\n  }\n} card.arv component Card {\n  slots { root {} media {} body {} }\n\n  base {\n    display: flex;\n    flex-direction: column;\n    gap: space.3;\n  }\n\n  variants {\n    layout {\n      stacked {}\n      row {\n        flex-direction: row;\n        media { width: 40%; }\n      }\n    }\n  }\n\n  defaults { layout: stacked; }\n\n  container {\n    wide { layout: row; }   // ≥ 480px of available width → row\n  }\n} Container sizes live in the theme\'s container group, exactly parallel to breakpoints. The block reads: when this component\'s container is at least 480px wide, the layout variant becomes row — wherever that happens to occur on screen. What the compiler sets up Container queries need an element declared as a measurement container. Arvia handles that: a component with a `container` block gets `container-type: inline-size` on its root automatically, and the override styles are wrapped in `@container`: generated CSS .Card_root_0cgz70 {\n  container-type: inline-size;\n}\n\n.Card_layout_row_root_0cgz70 {\n  flex-direction: row;\n}\n\n@container (min-width: 480px) {\n.Card_layout_row_cq_wide_root_0cgz70 {\n  flex-direction: row;\n}\n} The measured container is the nearest ancestor with a container-type — for this component\'s children, its own root. Sizing the root itself with a container query is impossible by CSS\'s rules (a container cannot query itself), which is why container overrides are most useful on inner slots and layout properties. Call-site control with $ keys Like `responsive` blocks, container behavior is also available per call site. Container keys are prefixed with $ to keep the two query kinds distinct in one object: App.tsx Card({ layout: { initial: "stacked", $wide: "row" } }); generated .d.ts export type CardProps = {\n  layout?: "stacked" | "row" | { initial?: "stacked" | "row"; "$wide"?: "stacked" | "row"; };\n}; The semantics mirror responsive props exactly: passing a plain value pins the variant and disables the component\'s `container` block for it; the object form sets the initial value and per-container-size overrides; and the available $ keys are the ones the component\'s `container` block declared. Mixing viewport and container A component can carry both blocks, and one variant can be driven by both. The object prop form then accepts both key kinds — bare names are breakpoints, $-names are container sizes: theme {\n  breakpoint { md = 768px; }\n  container { wide = 480px; }\n}\n\ncomponent Toolbar {\n  variants {\n    density { compact { gap: space.1; } cozy { gap: space.3; } }\n  }\n  defaults { density: compact; }\n\n  responsive { md { density: cozy; } }     // page got roomier\n  container { wide { density: cozy; } }    // or just this toolbar did\n}\n\n// Toolbar({ density: { initial: "compact", md: "cozy", $wide: "cozy" } }) Both query kinds emit additive classes with the same specificity, so when several apply the later stylesheet rule wins. In practice the rule of thumb stays simple: viewport for page chrome, container for everything you expect to drop into unknown layouts. A worked example The payoff is components that are correct by construction wherever they land. This stat panel switches to a horizontal layout only when its spot actually affords it: stat-panel.arv component StatPanel {\n  slots { root {} value {} label {} delta {} }\n\n  base {\n    use Surface;\n    display: flex;\n    flex-direction: column;\n    gap: space.1;\n    padding: space.4;\n\n    value { font-size: font.xl; font-weight: 700; }\n    label { color: color.muted; font-size: font.sm; }\n  }\n\n  variants {\n    arrangement {\n      stacked {}\n      inline {\n        flex-direction: row;\n        align-items: baseline;\n        gap: space.3;\n        value { font-size: font.lg; }\n      }\n    }\n  }\n\n  defaults { arrangement: stacked; }\n\n  container {\n    wide { arrangement: inline; }\n  }\n} Dashboard.tsx // Same component, no props, both placements correct:\n<aside className={sidebar}>\n  <StatPanelView />   {/* 280px slot → stacked */}\n</aside>\n<main className={main}>\n  <StatPanelView />   {/* 720px slot → inline, automatically */}\n</main> Name container sizes by meaning (wide, full, split) rather than by pixel value — the threshold lives in the theme and can be tuned once for every component that uses it.',
};

export function ContainerQueriesPage() {
  return (
    <DocArticle meta={container_queriesMeta}>
      <DocP>
        <fbt desc="Docs content — container: opening">
          {
            "A breakpoint answers the wrong question for reusable components: a card needs to know how wide it is, not how wide the screen is — the same card may render in a 300px sidebar and a 900px main column on one page. Container blocks switch variants based on the component's own rendered width:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  container {
    wide = 480px;
  }
}`}
      />
      <DocCode
        label={"card.arv"}
        code={`component Card {
  slots { root {} media {} body {} }

  base {
    display: flex;
    flex-direction: column;
    gap: space.3;
  }

  variants {
    layout {
      stacked {}
      row {
        flex-direction: row;
        media { width: 40%; }
      }
    }
  }

  defaults { layout: stacked; }

  container {
    wide { layout: row; }   // ≥ 480px of available width → row
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — container: basic semantics">
          {
            "Container sizes live in the theme's container group, exactly parallel to breakpoints. The block reads: when this component's container is at least 480px wide, the layout variant becomes row — wherever that happens to occur on screen."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: container setup">{"What the compiler sets up"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — container: setup lead-in">
          {
            "Container queries need an element declared as a measurement container. Arvia handles that: a component with a `container` block gets `container-type: inline-size` on its root automatically, and the override styles are wrapped in `@container`:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`.Card_root_0cgz70 {
  container-type: inline-size;
}

.Card_layout_row_root_0cgz70 {
  flex-direction: row;
}

@container (min-width: 480px) {
.Card_layout_row_cq_wide_root_0cgz70 {
  flex-direction: row;
}
}`}
      />
      <DocCallout tone="warning">
        <fbt desc="Docs note — container: nearest ancestor">
          {
            "The measured container is the nearest ancestor with a container-type — for this component's children, its own root. Sizing the root itself with a container query is impossible by CSS's rules (a container cannot query itself), which is why container overrides are most useful on inner slots and layout properties."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: dollar keys">{"Call-site control with $ keys"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — container: dollar lead-in">
          {
            "Like `responsive` blocks, container behavior is also available per call site. Container keys are prefixed with $ to keep the two query kinds distinct in one object:"
          }
        </fbt>
      </DocP>
      <DocCode label={"App.tsx"} code={`Card({ layout: { initial: "stacked", $wide: "row" } });`} />
      <DocCode
        label={"generated .d.ts"}
        code={`export type CardProps = {
  layout?: "stacked" | "row" | { initial?: "stacked" | "row"; "$wide"?: "stacked" | "row"; };
};`}
      />
      <DocP>
        <fbt desc="Docs content — container: prop semantics">
          {
            "The semantics mirror responsive props exactly: passing a plain value pins the variant and disables the component's `container` block for it; the object form sets the initial value and per-container-size overrides; and the available $ keys are the ones the component's `container` block declared."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: mixing queries">{"Mixing viewport and container"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — container: mixing lead-in">
          {
            "A component can carry both blocks, and one variant can be driven by both. The object prop form then accepts both key kinds — bare names are breakpoints, $-names are container sizes:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`theme {
  breakpoint { md = 768px; }
  container { wide = 480px; }
}

component Toolbar {
  variants {
    density { compact { gap: space.1; } cozy { gap: space.3; } }
  }
  defaults { density: compact; }

  responsive { md { density: cozy; } }     // page got roomier
  container { wide { density: cozy; } }    // or just this toolbar did
}

// Toolbar({ density: { initial: "compact", md: "cozy", $wide: "cozy" } })`}
      />
      <DocP>
        <fbt desc="Docs content — container: mixing semantics">
          {
            "Both query kinds emit additive classes with the same specificity, so when several apply the later stylesheet rule wins. In practice the rule of thumb stays simple: viewport for page chrome, container for everything you expect to drop into unknown layouts."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: container worked example">{"A worked example"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — container: worked lead-in">
          {
            "The payoff is components that are correct by construction wherever they land. This stat panel switches to a horizontal layout only when its spot actually affords it:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"stat-panel.arv"}
        code={`component StatPanel {
  slots { root {} value {} label {} delta {} }

  base {
    use Surface;
    display: flex;
    flex-direction: column;
    gap: space.1;
    padding: space.4;

    value { font-size: font.xl; font-weight: 700; }
    label { color: color.muted; font-size: font.sm; }
  }

  variants {
    arrangement {
      stacked {}
      inline {
        flex-direction: row;
        align-items: baseline;
        gap: space.3;
        value { font-size: font.lg; }
      }
    }
  }

  defaults { arrangement: stacked; }

  container {
    wide { arrangement: inline; }
  }
}`}
      />
      <DocCode
        label={"Dashboard.tsx"}
        code={`// Same component, no props, both placements correct:
<aside className={sidebar}>
  <StatPanelView />   {/* 280px slot → stacked */}
</aside>
<main className={main}>
  <StatPanelView />   {/* 720px slot → inline, automatically */}
</main>`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — container: naming sizes">
          {
            "Name container sizes by meaning (wide, full, split) rather than by pixel value — the threshold lives in the theme and can be tuned once for every component that uses it."
          }
        </fbt>
      </DocCallout>
    </DocArticle>
  );
}
