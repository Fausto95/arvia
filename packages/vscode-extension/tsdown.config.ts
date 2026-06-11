import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/extension.ts"],
  format: ["cjs"],
  dts: false,
  sourcemap: true,
  target: "es2022",
  external: ["vscode", "vscode-languageclient", "vscode-languageclient/node"],
});
