import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "../../../src/atoms/stack.arv";
import { Text } from "../../../src/atoms/text.arv";
import { tokens } from "../../../src/theme.arv";

function TokenSwatch(props: { name: string; value: string; doc?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          background: props.value,
          border: `1px solid ${tokens.color.border}`,
        }}
      />
      <span className={Text({ size: "sm", weight: "medium" }).root}>{props.name}</span>
      {props.doc ? (
        <span className={Text({ size: "sm", tone: "muted" }).root}>{props.doc}</span>
      ) : null}
    </div>
  );
}

function ThemeOverview() {
  const grid = Stack({ direction: "row", gap: "5", wrap: "yes" });
  const section = Stack({ gap: "3" });

  return (
    <div className={Stack({ gap: "6" }).root} style={{ maxWidth: 720 }}>
      <div className={section.root}>
        <h2 className={Text({ size: "lg", weight: "bold" }).root}>Color tokens</h2>
        <div className={grid.root}>
          <TokenSwatch
            name="primary"
            value={tokens.color.primary}
            doc="Brand primary — CTAs and links"
          />
          <TokenSwatch name="danger" value={tokens.color.danger} doc="Destructive actions" />
          <TokenSwatch name="success" value={tokens.color.success} doc="Positive feedback" />
          <TokenSwatch name="warning" value={tokens.color.warning} doc="Caution states" />
        </div>
      </div>

      <div className={section.root}>
        <h2 className={Text({ size: "lg", weight: "bold" }).root}>Spacing scale</h2>
        <div className={grid.root}>
          {(["1", "2", "3", "4", "5", "6"] as const).map((key) => (
            <div
              key={key}
              style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}
            >
              <div
                style={{
                  width: tokens.space[key],
                  height: tokens.space[key],
                  background: tokens.color.primary,
                  borderRadius: 4,
                }}
              />
              <span className={Text({ size: "sm", tone: "muted" }).root}>space.{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={section.root}>
        <h2 className={Text({ size: "lg", weight: "bold" }).root}>Typography</h2>
        <div className={Stack({ gap: "2" }).root}>
          <p className={Text({ size: "sm" }).root}>font.sm — Small body text</p>
          <p className={Text({ size: "md" }).root}>font.md — Default body text</p>
          <p className={Text({ size: "lg" }).root}>font.lg — Large text</p>
          <p className={Text({ size: "xl", weight: "bold" }).root}>font.xl — Heading</p>
        </div>
      </div>

      <p className={Text({ size: "sm", tone: "muted" }).root}>
        Toggle light/dark mode using the toolbar above. Theme modes are defined in src/theme.arv
        with @dark overrides.
      </p>
    </div>
  );
}

const meta: Meta<typeof ThemeOverview> = {
  title: "Theme/Overview",
  component: ThemeOverview,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ThemeOverview>;

export const Default: Story = {};
