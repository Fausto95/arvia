#!/usr/bin/env node
/**
 * Smoke test: pack @arviahq/* tarballs and install into a fresh Vite+React
 * project without publishing to npm.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packDir = fs.mkdtempSync(path.join(os.tmpdir(), "arvia-pack-"));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arvia-smoke-"));

const packages = [
  "compiler",
  "docs",
  "storybook",
  "typescript-plugin",
  "vite-plugin",
  "vite-plugin-react",
];

const tarballs = [];
for (const pkg of packages) {
  const dir = path.join(root, "packages", pkg);
  execSync(`pnpm pack --pack-destination ${JSON.stringify(packDir)}`, {
    cwd: dir,
    stdio: "inherit",
  });
  const name = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")).name;
  const base = name.replace("@arviahq/", "arviahq-");
  const file = fs.readdirSync(packDir).find((f) => f.startsWith(base) && f.endsWith(".tgz"));
  if (!file) throw new Error(`missing tarball for ${name}`);
  tarballs.push(path.join(packDir, file));
}

console.log("\nCreating Vite React app in", tmp);
execSync(`npm create vite@latest app -- --template react-ts`, { cwd: tmp, stdio: "inherit" });
const app = path.join(tmp, "app");

execSync(`npm install ${tarballs.map((t) => JSON.stringify(t)).join(" ")}`, {
  cwd: app,
  stdio: "inherit",
});

const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [arvia(), react()],
});
`;
fs.writeFileSync(path.join(app, "vite.config.ts"), viteConfig);

const tsconfigPath = path.join(app, "tsconfig.app.json");
let tsconfigText = fs.readFileSync(tsconfigPath, "utf8");
if (!tsconfigText.includes("@arviahq/typescript-plugin")) {
  tsconfigText = tsconfigText.replace(
    '"compilerOptions": {',
    '"compilerOptions": {\n    "plugins": [{ "name": "@arviahq/typescript-plugin" }],',
  );
  fs.writeFileSync(tsconfigPath, tsconfigText);
}

fs.mkdirSync(path.join(app, "src"), { recursive: true });
fs.writeFileSync(
  path.join(app, "src", "theme.arv"),
  `theme { color { primary = #635bff; } }\n`,
);
fs.writeFileSync(
  path.join(app, "src", "button.arv"),
  `component Button { base { color: color.primary; padding: 8px; } }\n`,
);
fs.writeFileSync(
  path.join(app, "src", "App.tsx"),
  `import "./theme.arv";
import { Button } from "./button.arv";

export default function App() {
  const styles = Button();
  return <button className={styles.root}>Hello</button>;
}
`,
);

console.log("\nBuilding smoke app (Vite + Arvia)…");
execSync("npx vite build", { cwd: app, stdio: "inherit" });
console.log("\nSmoke test passed:", app);
