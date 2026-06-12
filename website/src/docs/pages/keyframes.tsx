import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const keyframesMeta: DocPageMeta = {
  slug: "keyframes",
  title: <fbt desc="Docs page title — Keyframes">{"Keyframes"}</fbt>,
  description: (
    <fbt desc="Docs page description — Named animations referenced from components.">
      {"Named animations with token support and collision-free names."}
    </fbt>
  ),
  nav: { section: "language", order: 18 },
  searchText:
    'A `keyframes` block declares a CSS animation. Steps are from, to, or percentages, and values resolve tokens like everywhere else. Components reference an animation as `keyframes.name`: theme {\n  duration { fast = 120ms; normal = 200ms; }\n  easing { out = cubic-bezier(0.16, 1, 0.3, 1); }\n}\n\nkeyframes fadeIn {\n  from { opacity: 0; transform: translateY(4px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\ncomponent Toast {\n  base {\n    animation: keyframes.fadeIn duration.normal easing.out;\n  }\n} Hashed names Animation names share one global namespace in CSS, so the compiler hashes them the same way it hashes class names — fadeIn becomes something like fadeIn_1kqpaa, and the `keyframes.fadeIn` reference resolves to the hashed name: generated CSS @keyframes fadeIn_1kqpaa {\nfrom {\n  opacity: 0;\n  transform: translateY(4px);\n}\n\nto {\n  opacity: 1;\n  transform: translateY(0);\n}\n}\n\n.Toast_root_0tzzc8 {\n  animation: fadeIn_1kqpaa 200ms cubic-bezier(0.16, 1, 0.3, 1);\n} Two files can each declare a fadeIn without colliding, and your animation never fights one from a third-party stylesheet. The flip side: always reference through `keyframes.name` — a hand-written animation: fadeIn would point at a name that does not exist in the output. Multi-step and tokens in frames Percentage steps express richer motion, and token references inside frames keep animation colors and distances on-system: keyframes pulseRing {\n  0%   { box-shadow: 0 0 0 0 color.primary; }\n  70%  { box-shadow: 0 0 0 space.3 transparent; }\n  100% { box-shadow: 0 0 0 0 transparent; }\n}\n\nkeyframes shimmer {\n  from { background-position: -200% 0; }\n  to   { background-position: 200% 0; }\n}\n\ncomponent Skeleton {\n  base {\n    background: linear-gradient(90deg, color.border, color.surface, color.border);\n    background-size: 200% 100%;\n    animation: keyframes.shimmer 1.4s linear infinite;\n  }\n} Like recipes and tokens, keyframes declared in the shared theme file are usable from every component file; keyframes declared elsewhere are local to their file. Animations per variant or state component SaveButton {\n  variants {\n    status {\n      idle {}\n      saving {\n        animation: keyframes.pulse 1s ease infinite;\n      }\n    }\n  }\n  defaults { status: idle; }\n} Respecting reduced motion Honor `prefers-reduced-motion` at the document level. Arvia\'s `global` block intentionally has no at-rule support, so this one rule belongs in a small plain CSS file next to your entry point — `!important` lets it cut through every hashed class: src/motion.css @media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n  }\n} src/main.tsx import "./theme.arv";\nimport "./motion.css";',
};

export function KeyframesPage() {
  return (
    <DocArticle meta={keyframesMeta}>
      <DocP>
        <fbt desc="Docs content — keyframes: opening">
          {
            "A `keyframes` block declares a CSS animation. Steps are from, to, or percentages, and values resolve tokens like everywhere else. Components reference an animation as `keyframes.name`:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`theme {
  duration { fast = 120ms; normal = 200ms; }
  easing { out = cubic-bezier(0.16, 1, 0.3, 1); }
}

keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

component Toast {
  base {
    animation: keyframes.fadeIn duration.normal easing.out;
  }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: keyframes hashed">{"Hashed names"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — keyframes: hashing lead-in">
          {
            "Animation names share one global namespace in CSS, so the compiler hashes them the same way it hashes class names — fadeIn becomes something like fadeIn_1kqpaa, and the `keyframes.fadeIn` reference resolves to the hashed name:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`@keyframes fadeIn_1kqpaa {
from {
  opacity: 0;
  transform: translateY(4px);
}

to {
  opacity: 1;
  transform: translateY(0);
}
}

.Toast_root_0tzzc8 {
  animation: fadeIn_1kqpaa 200ms cubic-bezier(0.16, 1, 0.3, 1);
}`}
      />
      <DocP>
        <fbt desc="Docs content — keyframes: hashing consequences">
          {
            "Two files can each declare a fadeIn without colliding, and your animation never fights one from a third-party stylesheet. The flip side: always reference through `keyframes.name` — a hand-written animation: fadeIn would point at a name that does not exist in the output."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: keyframes multi-step">
          {"Multi-step and tokens in frames"}
        </fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — keyframes: multi-step lead-in">
          {
            "Percentage steps express richer motion, and token references inside frames keep animation colors and distances on-system:"
          }
        </fbt>
      </DocP>
      <DocCode
        code={`keyframes pulseRing {
  0%   { box-shadow: 0 0 0 0 color.primary; }
  70%  { box-shadow: 0 0 0 space.3 transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}

component Skeleton {
  base {
    background: linear-gradient(90deg, color.border, color.surface, color.border);
    background-size: 200% 100%;
    animation: keyframes.shimmer 1.4s linear infinite;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — keyframes: theme availability">
          {
            "Like recipes and tokens, keyframes declared in the shared theme file are usable from every component file; keyframes declared elsewhere are local to their file."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: keyframes per variant">
          {"Animations per variant or state"}
        </fbt>
      </DocH2>
      <DocCode
        code={`component SaveButton {
  variants {
    status {
      idle {}
      saving {
        animation: keyframes.pulse 1s ease infinite;
      }
    }
  }
  defaults { status: idle; }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: reduced motion">{"Respecting reduced motion"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — keyframes: reduced motion lead-in">
          {
            "Honor `prefers-reduced-motion` at the document level. Arvia's `global` block intentionally has no at-rule support, so this one rule belongs in a small plain CSS file next to your entry point — `!important` lets it cut through every hashed class:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/motion.css"}
        lang={"css"}
        code={`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}`}
      />
      <DocCode
        label={"src/main.tsx"}
        code={`import "./theme.arv";
import "./motion.css";`}
      />
    </DocArticle>
  );
}
