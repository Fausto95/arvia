import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";
import { hashName } from "../src/ir/hash.js";

type StyleFn = (props?: Record<string, string>) => Record<string, string>;

/** Imports the generated module via a data: URL and returns one export. */
async function load(js: string, name: string): Promise<StyleFn> {
  const url = `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`;
  const mod = (await import(url)) as Record<string, StyleFn | undefined>;
  const fn = mod[name];
  if (!fn) throw new Error(`generated module has no export '${name}'`);
  return fn;
}

describe("generated JS behaves per spec", () => {
  const source = readFileSync(
    fileURLToPath(new URL("./fixtures/button.arv", import.meta.url)),
    "utf8",
  );
  const { js } = compile(source, { filename: "button.arv" });
  const h = hashName("button.arv", "Button");

  it("applies defaults when called without props", async () => {
    const Button = await load(js!, "Button");
    const styles = Button();
    expect(styles.root).toBe(
      `Button_root_${h} Button_size_md_root_${h} Button_tone_primary_root_${h}`,
    );
    expect(styles.icon).toBe(`Button_icon_${h}`);
    expect(styles.label).toBe(`Button_label_${h}`);
  });

  it("applies explicit variants per slot", async () => {
    const Button = await load(js!, "Button");
    const styles = Button({ size: "lg", tone: "danger" });
    expect(styles.root).toBe(
      `Button_root_${h} Button_size_lg_root_${h} Button_tone_danger_root_${h}`,
    );
    expect(styles.icon).toBe(`Button_icon_${h} Button_size_lg_icon_${h}`);
  });

  it("applies compound classes only when all matchers match", async () => {
    const Button = await load(js!, "Button");
    expect(Button({ size: "sm", tone: "danger" }).root).toBe(
      `Button_root_${h} Button_size_sm_root_${h} Button_tone_danger_root_${h} Button_size_sm_tone_danger_root_${h}`,
    );
    expect(Button({ size: "sm" }).root).not.toContain("Button_size_sm_tone_danger");
  });

  it("compound matchers honor defaults", async () => {
    const Button = await load(js!, "Button");
    // defaults: size md — compound needs sm, so passing only tone must not match.
    expect(Button({ tone: "danger" }).root).not.toContain("sm_tone_danger");
  });

  it("partial props fall back per variant", async () => {
    const Button = await load(js!, "Button");
    const styles = Button({ tone: "danger" });
    expect(styles.root).toContain(`Button_size_md_root_${h}`);
    expect(styles.root).toContain(`Button_tone_danger_root_${h}`);
  });

  it("variants without a default contribute nothing when unset", async () => {
    const result = compile("component Chip { variants { tone { a { color: red; } } } }", {
      filename: "chip.arv",
    });
    const Chip = await load(result.js!, "Chip");
    const ch = hashName("chip.arv", "Chip");
    expect(Chip().root).toBe(`Chip_root_${ch}`);
    expect(Chip({ tone: "a" }).root).toBe(`Chip_root_${ch} Chip_tone_a_root_${ch}`);
  });
});
