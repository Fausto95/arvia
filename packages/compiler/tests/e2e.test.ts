import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const fixturesDir = fileURLToPath(new URL("./fixtures", import.meta.url));

describe("golden fixtures", () => {
  for (const file of readdirSync(fixturesDir).filter((f) => f.endsWith(".arv"))) {
    it(file, () => {
      const source = readFileSync(join(fixturesDir, file), "utf8");
      const result = compile(source, { filename: file });
      expect(result.diagnostics.filter((d) => d.severity === "error")).toEqual([]);
      expect(result.css).toMatchSnapshot("css");
      expect(result.js).toMatchSnapshot("js");
      expect(result.dts).toMatchSnapshot("dts");
    });
  }
});
