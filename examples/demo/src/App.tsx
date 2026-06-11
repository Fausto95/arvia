import type { ReactNode } from "react";
import { useState } from "react";
import clsx from "clsx";
import { setTheme } from "./arvia-theme";
import { Badge } from "./components/badge.arv";
import { Button, type ButtonProps } from "./components/button.arv";
import { Card } from "./components/card.arv";
import { Stack } from "./components/stack.arv";
import { Text } from "./components/text.arv";
import { Recipes } from "./Recipes";

const SIZES = ["sm", "md", "lg"] as const;
const TONES = ["primary", "danger", "ghost"] as const;
const BADGE_TONES = ["neutral", "success", "warning", "danger"] as const;

function DemoButton(
  props: ButtonProps & { children: ReactNode; disabled?: boolean; onClick?: () => void },
) {
  const styles = Button({ size: props.size, tone: props.tone });
  return (
    <button className={styles.root} disabled={props.disabled} onClick={props.onClick} type="button">
      <span className={styles.icon}>✦</span>
      <span className={styles.label}>{props.children}</span>
    </button>
  );
}

function Section(props: { title: string; children: ReactNode }) {
  const card = Card();
  return (
    <section className={card.root}>
      <header className={card.header}>
        <Heading size="lg">{props.title}</Heading>
      </header>
      <div className={card.body}>{props.children}</div>
    </section>
  );
}

function Heading(props: { size?: "lg" | "xl" | "2xl"; children: ReactNode }) {
  return (
    <h2 className={Text({ size: props.size ?? "lg", weight: "bold" }).root}>{props.children}</h2>
  );
}

function Tab(props: { active: boolean; onClick: () => void; children: ReactNode }) {
  const styles = Button({
    tone: props.active ? "primary" : "ghost",
    size: "sm",
  });
  return (
    <button type="button" className={styles.root} onClick={props.onClick}>
      <span className={styles.label}>{props.children}</span>
    </button>
  );
}

export function App() {
  const [view, setView] = useState<"playground" | "recipes">("playground");
  const page = Stack({ gap: "5" });
  const row = Stack({ direction: "row", gap: "3", align: "center", wrap: "yes" });

  return (
    <main className={page.root} style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <header>
        <div className={row.root} style={{ justifyContent: "space-between" }}>
          <Heading size="2xl">Arvia Playground</Heading>
          <div className={row.root}>
            <DemoButton size="sm" tone="ghost" onClick={() => setTheme("light")}>
              Light
            </DemoButton>
            <DemoButton size="sm" tone="ghost" onClick={() => setTheme("dark")}>
              Dark
            </DemoButton>
          </div>
        </div>
        <p className={Text({ tone: "muted" }).root}>
          Every style on this page is compiled from <code>.arv</code> files — zero runtime CSS.
        </p>
        <div className={row.root} style={{ marginTop: 16 }}>
          <Tab active={view === "playground"} onClick={() => setView("playground")}>
            Playground
          </Tab>
          <Tab active={view === "recipes"} onClick={() => setView("recipes")}>
            Recipes
          </Tab>
        </div>
      </header>

      {view === "recipes" ? (
        <Recipes />
      ) : (
        <>
          <Section title="Button — sizes × tones, compound variant on sm + danger">
            <div className={Stack({ gap: "4" }).root}>
              {TONES.map((tone) => (
                <div key={tone} className={row.root}>
                  {SIZES.map((size) => (
                    <DemoButton key={size} size={size} tone={tone}>
                      {tone} {size}
                    </DemoButton>
                  ))}
                  <DemoButton tone={tone} disabled>
                    disabled
                  </DemoButton>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Badge — tone variants">
            <div className={row.root}>
              {BADGE_TONES.map((tone) => (
                <span key={tone} className={Badge({ tone }).root}>
                  {tone}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Text — typography tokens">
            <div className={Stack({ gap: "2" }).root}>
              <p className={Text({ size: "2xl", weight: "bold" }).root}>
                The five boxing wizards (2xl)
              </p>
              <p className={Text({ size: "xl", weight: "medium" }).root}>
                The five boxing wizards (xl)
              </p>
              <p className={Text({ size: "lg" }).root}>The five boxing wizards (lg)</p>
              <p className={Text({ size: "md" }).root}>The five boxing wizards (md)</p>
              <p className={Text({ size: "sm", tone: "muted" }).root}>
                The five boxing wizards (sm, muted)
              </p>
              <p className={Text({ tone: "primary", weight: "medium" }).root}>Primary tone</p>
            </div>
          </Section>

          <Section title="Button — responsive (resize viewport)">
            <p className={Text({ size: "sm", tone: "muted" }).root}>
              Defaults to <code>sm</code>; the <code>responsive</code> block bumps to{" "}
              <code>md</code> at 768px and <code>lg</code> at 1024px.
            </p>
            <div className={row.root}>
              <DemoButton size={{ initial: "sm", md: "md", lg: "lg" } as const} tone="primary">
                responsive
              </DemoButton>
            </div>
          </Section>

          <Section title="Card — container queries (resize the box)">
            <ContainerCardDemo />
          </Section>

          <Section title="Card — recipe (Surface) + slots">
            <CardDemo />
          </Section>
        </>
      )}
    </main>
  );
}

function ContainerCardDemo() {
  const card = Card({
    layout: { initial: "stacked", $wide: "horizontal" } as const,
  });
  return (
    <div
      className={card.root}
      style={{
        resize: "horizontal",
        overflow: "auto",
        minWidth: 200,
        maxWidth: "100%",
        width: 360,
      }}
    >
      <header className={card.header}>Container query demo</header>
      <div className={card.body}>
        <p className={Text({ tone: "muted", size: "sm" }).root}>
          Drag the handle — layout switches to horizontal past the <code>wide</code> container token
          (560px).
        </p>
        <span className={Badge({ tone: "neutral" }).root}>stacked → row</span>
      </div>
    </div>
  );
}

function CardDemo() {
  const card = Card();
  return (
    <div className={card.root}>
      <header className={card.header}>Invoice #1042</header>
      <div className={card.body}>
        <p className={Text({ tone: "muted" }).root}>
          The header, body and footer of this card are separate slots styled by one component.
        </p>
      </div>
      <footer className={clsx(card.footer, Text({ size: "sm", tone: "muted" }).root)}>
        Due in 14 days
      </footer>
    </div>
  );
}
