import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Text } from "../components/text.arv";
import { DemoBadge } from "./components/demo-badge.arv";
import { DemoButton } from "./components/demo-button.arv";
import { DemoCard } from "./components/demo-card.arv";
import { DemoPulseBox } from "./components/demo-pulse.arv";
import { DemoStack } from "./components/demo-stack.arv";
import { DemoText } from "./components/demo-text.arv";
import { PlaygroundSection } from "./playground-layout.arv";
import { PropPicker, PropRow, PropToggle } from "./PropControls";

const SIZES = ["sm", "md", "lg"] as const;
const TONES = ["primary", "danger", "ghost"] as const;
const BADGE_TONES = ["neutral", "success", "warning", "danger"] as const;

type ButtonSize = (typeof SIZES)[number];
type ButtonTone = (typeof TONES)[number];

function Section(props: {
  title: string;
  description?: string;
  controls?: ReactNode;
  children: ReactNode;
}) {
  const section = PlaygroundSection();
  return (
    <section className={section.root}>
      <header className={section.header}>
        <h3 className={section.title}>{props.title}</h3>
        {props.description ? <p className={section.description}>{props.description}</p> : null}
      </header>
      {props.controls ? <div className={section.controls}>{props.controls}</div> : null}
      <div className={section.preview}>{props.children}</div>
    </section>
  );
}

function GalleryButton(props: {
  size?: ButtonSize;
  tone?: ButtonTone;
  disabled?: boolean;
  children: ReactNode;
  responsive?: boolean;
}) {
  const styles = DemoButton({
    size: props.responsive ? ({ initial: "sm", md: "md", lg: "lg" } as const) : props.size,
    tone: props.tone,
  });
  return (
    <button className={styles.root} disabled={props.disabled} type="button">
      <span className={styles.icon}>✦</span>
      <span className={styles.label}>{props.children}</span>
    </button>
  );
}

function useBreakpoint() {
  const [bp, setBp] = useState<"initial" | "md" | "lg">("initial");

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setBp("lg");
      else if (w >= 768) setBp("md");
      else setBp("initial");
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

export function Gallery() {
  const [size, setSize] = useState<ButtonSize>("md");
  const [tone, setTone] = useState<ButtonTone>("primary");
  const [disabled, setDisabled] = useState(false);
  const [containerWidth, setContainerWidth] = useState(360);
  const breakpoint = useBreakpoint();

  const stack = DemoStack({ gap: "5" });
  const row = DemoStack({ direction: "row", gap: "3", align: "center", wrap: "yes" });
  const buttonStyles = DemoButton({ size, tone });

  return (
    <div className={stack.root}>
      <Section
        title="Button lab"
        description="Tune size, tone, and disabled — see the generated class string update live."
        controls={
          <PropRow>
            <PropPicker label="Size" value={size} options={SIZES} onChange={setSize} />
            <PropPicker label="Tone" value={tone} options={TONES} onChange={setTone} />
            <PropToggle label="Disabled" checked={disabled} onChange={setDisabled} />
          </PropRow>
        }
      >
        <div className={stack.root} style={{ gap: 16 }}>
          <GalleryButton size={size} tone={tone} disabled={disabled}>
            {tone} {size}
          </GalleryButton>
          <p className={Text({ size: "sm", tone: "muted" }).root}>
            <code style={{ fontSize: 12 }}>{buttonStyles.root}</code>
          </p>
        </div>
      </Section>

      <Section title="Badge & status" description="Tone variants in a notification-style row.">
        <div className={row.root}>
          {BADGE_TONES.map((t) => (
            <span key={t} className={DemoBadge({ tone: t }).root}>
              {t}
            </span>
          ))}
        </div>
        <div className={DemoCard().root} style={{ marginTop: 16, maxWidth: 420 }}>
          <header className={DemoCard().header}>
            <div className={row.root} style={{ justifyContent: "space-between" }}>
              <span>Deploy complete</span>
              <span className={DemoBadge({ tone: "success" }).root}>live</span>
            </div>
          </header>
          <div className={DemoCard().body}>
            <p className={DemoText({ tone: "muted", size: "sm" }).root}>
              v2.4.1 shipped to production — all checks passed.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Typography" description="Type scale driven by font tokens.">
        <div className={DemoStack({ gap: "2" }).root}>
          <p className={DemoText({ size: "2xl", weight: "bold" }).root}>Display scale (2xl)</p>
          <p className={DemoText({ size: "xl", weight: "medium" }).root}>Heading xl</p>
          <p className={DemoText({ size: "lg" }).root}>Body large</p>
          <p className={DemoText({ size: "md" }).root}>Body default</p>
          <p className={DemoText({ size: "sm", tone: "muted" }).root}>Caption muted</p>
          <p className={DemoText({ tone: "primary", weight: "medium" }).root}>Accent tone</p>
        </div>
      </Section>

      <Section
        title="Card composition"
        description="Multi-slot card with header, body, and footer."
      >
        {(() => {
          const card = DemoCard();
          return (
            <div className={card.root} style={{ maxWidth: 400 }}>
              <header className={card.header}>Invoice #1042</header>
              <div className={card.body}>
                <p className={DemoText({ tone: "muted" }).root}>
                  The header, body and footer are separate slots styled by one component.
                </p>
              </div>
              <footer className={clsx(card.footer, DemoText({ size: "sm", tone: "muted" }).root)}>
                Due in 14 days
              </footer>
            </div>
          );
        })()}
      </Section>

      <Section
        title="States"
        description="Hover, focus (tab to see ring), active, and disabled pseudo-states."
      >
        <div className={row.root}>
          <GalleryButton tone="primary">hover me</GalleryButton>
          <GalleryButton tone="primary" disabled>
            disabled
          </GalleryButton>
        </div>
      </Section>

      <Section
        title="Responsive"
        description="Button size bumps at 768px (md) and 1024px (lg). Resize the viewport."
      >
        <p className={DemoText({ size: "sm", tone: "muted" }).root} style={{ marginBottom: 12 }}>
          Current breakpoint: <code>{breakpoint}</code>
        </p>
        <GalleryButton responsive tone="primary">
          responsive
        </GalleryButton>
      </Section>

      <Section
        title="Container queries"
        description="Drag the handle — layout switches to horizontal past the wide container token (560px)."
      >
        {(() => {
          const card = DemoCard({
            layout: { initial: "stacked", $wide: "horizontal" } as const,
          });
          return (
            <div>
              <p
                className={DemoText({ size: "sm", tone: "muted" }).root}
                style={{ marginBottom: 12 }}
              >
                Width: {Math.round(containerWidth)}px
              </p>
              <div
                className={card.root}
                style={{
                  resize: "horizontal",
                  overflow: "auto",
                  minWidth: 200,
                  maxWidth: "100%",
                  width: containerWidth,
                }}
                onMouseUp={(e) => setContainerWidth(e.currentTarget.offsetWidth)}
              >
                <header className={card.header}>Container query demo</header>
                <div className={card.body}>
                  <p className={DemoText({ tone: "muted", size: "sm" }).root}>
                    Layout flips when the container exceeds 560px.
                  </p>
                  <span className={DemoBadge({ tone: "neutral" }).root}>stacked → row</span>
                </div>
              </div>
            </div>
          );
        })()}
      </Section>

      <Section title="Motion" description="Keyframes and animation tokens.">
        <div className={row.root}>
          <div className={DemoPulseBox().root}>pulsing</div>
        </div>
      </Section>
    </div>
  );
}
