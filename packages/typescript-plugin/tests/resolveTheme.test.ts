import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compileDts } from "@arviahq/compiler";
import { themeEnvFor, themePathFor } from "../src/resolveTheme.js";

const demoButton = fileURLToPath(
  new URL("../../../examples/demo/src/components/button.arv", import.meta.url),
);

describe("resolveTheme", () => {
  it("finds the demo theme from a component path", () => {
    const themePath = themePathFor(demoButton);
    expect(themePath).toContain("examples/demo/src/theme.arv");
    const env = themeEnvFor(demoButton);
    expect(env?.breakpoints).toMatchObject({ sm: "640px", md: "768px", lg: "1024px" });
    expect(env?.containers).toMatchObject({ narrow: "320px", wide: "560px" });
  });

  it("emits responsive prop types when theme env is provided", () => {
    const source = readFileSync(demoButton, "utf8");
    const { dts } = compileDts(source, { filename: demoButton, env: themeEnvFor(demoButton) });
    expect(dts).toContain("initial?:");
    expect(dts).toContain("md?:");
    expect(dts).not.toContain('"$wide"?:'); // Button has no container block
  });
});
