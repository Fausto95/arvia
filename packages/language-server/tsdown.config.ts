import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["cjs"],
  dts: true,
  sourcemap: true,
  target: "es2022",
});
