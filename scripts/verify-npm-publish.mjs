#!/usr/bin/env node
import { execSync } from "node:child_process";

const scope = "@arviahq";
const org = "arviahq";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

let username;
try {
  username = run("npm whoami");
} catch {
  console.error(
    "::error::NPM_TOKEN is missing or invalid. Add an npm automation token to GitHub repo secrets as NPM_TOKEN.",
  );
  process.exit(1);
}

console.log(`npm user: ${username}`);

try {
  run(`npm org ls ${org}`);
  console.log(`npm org: ${org} (member)`);
} catch {
  console.error(
    `::error::Cannot access npm org "${org}". Create it at https://www.npmjs.com/org/create, add ${username} as owner, then regenerate NPM_TOKEN with publish access to ${scope}/*.`,
  );
  process.exit(1);
}

console.log("npm publish access looks OK");
