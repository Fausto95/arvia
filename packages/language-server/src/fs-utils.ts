import fs from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "build", "coverage"]);

export function listArvFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.name.endsWith(".arv")) {
        out.push(path.join(dir, entry.name));
      }
    }
  };
  walk(root);
  return out;
}

export function readFileOr(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}
