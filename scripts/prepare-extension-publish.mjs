#!/usr/bin/env node
/**
 * Rewrites vscode-extension workspace:* deps to published semver ranges
 * before `vsce package` / `vsce publish`. Run after `changeset version`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extPkgPath = path.join(root, "packages/vscode-extension/package.json");
const extPkg = JSON.parse(fs.readFileSync(extPkgPath, "utf8"));

const depDirs = {
  "@arviahq/language-server": "packages/language-server",
  "@arviahq/typescript-plugin": "packages/typescript-plugin",
};

for (const [name, dir] of Object.entries(depDirs)) {
  const pkgPath = path.join(root, dir, "package.json");
  const version = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
  if (extPkg.dependencies?.[name]?.startsWith("workspace:")) {
    extPkg.dependencies[name] = `^${version}`;
  }
}

fs.writeFileSync(extPkgPath, `${JSON.stringify(extPkg, null, 2)}\n`);
console.log("Updated extension dependencies for publish.");
