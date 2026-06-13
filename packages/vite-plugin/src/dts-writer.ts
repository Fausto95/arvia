import fs from "node:fs";
import path from "node:path";

const timers = new Map<string, NodeJS.Timeout>();

function writeIfChanged(dtsPath: string, content: string) {
  let previous: string | undefined;
  try {
    previous = fs.readFileSync(dtsPath, "utf8");
  } catch {
    previous = undefined;
  }
  // Skipping identical writes keeps tsc --watch and editors from churning.
  if (previous === content) return;
  // Central-mode mirror dirs (`.arvia/types/...`) won't exist yet; sibling
  // dirs always do, so this is a no-op there.
  fs.mkdirSync(path.dirname(dtsPath), { recursive: true });
  fs.writeFileSync(dtsPath, content);
}

/**
 * Drops a self-ignoring `.gitignore` into the central dir so consumers never
 * commit generated declarations: it ignores everything in the folder except
 * itself. Written once; left alone if it already exists.
 */
export function ensureCentralGitignore(centralDir: string): void {
  const file = path.join(centralDir, ".gitignore");
  try {
    if (fs.existsSync(file)) return;
    fs.mkdirSync(centralDir, { recursive: true });
    fs.writeFileSync(file, "*\n!.gitignore\n");
  } catch {
    // Best-effort: a missing .gitignore is a hygiene issue, not a build failure.
  }
}

/** Debounced declaration write, used by the dev server. */
export function scheduleDtsWrite(dtsPath: string, content: string, delayMs = 50): void {
  const pending = timers.get(dtsPath);
  if (pending) clearTimeout(pending);
  timers.set(
    dtsPath,
    setTimeout(() => {
      timers.delete(dtsPath);
      writeIfChanged(dtsPath, content);
    }, delayMs),
  );
}

/** Immediate write, used by the CLI and at build time. */
export function writeDtsNow(dtsPath: string, content: string): void {
  const pending = timers.get(dtsPath);
  if (pending) {
    clearTimeout(pending);
    timers.delete(dtsPath);
  }
  writeIfChanged(dtsPath, content);
}

/**
 * Removes a generated declaration and cancels any pending write for it. When
 * `stopDir` is given (central mode), also prunes the now-empty mirror dirs up
 * to — but not including — `stopDir`, so deleting the last `.arv` in a folder
 * doesn't leave empty `.arvia/types` subtrees behind.
 */
export function removeDts(dtsPath: string, stopDir?: string): void {
  const pending = timers.get(dtsPath);
  if (pending) {
    clearTimeout(pending);
    timers.delete(dtsPath);
  }
  fs.rmSync(dtsPath, { force: true });

  if (!stopDir) return;
  const stop = path.resolve(stopDir);
  let dir = path.dirname(path.resolve(dtsPath));
  while (dir.startsWith(stop + path.sep)) {
    try {
      if (fs.readdirSync(dir).length > 0) break;
      fs.rmdirSync(dir);
    } catch {
      break;
    }
    dir = path.dirname(dir);
  }
}

/**
 * Mark-and-sweep for central mode: deletes every `*.arv.d.ts` under `centralDir`
 * whose path is not in `keep`. Self-heals orphans left by renames or deletes
 * that happened while no dev server / CLI run observed them. Safe because
 * `centralDir` is owned entirely by the plugin.
 */
export function sweepDtsDir(centralDir: string, keep: Set<string>): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(centralDir, { recursive: true, withFileTypes: true });
  } catch {
    return; // no central dir yet — nothing to sweep
  }
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".arv.d.ts")) continue;
    const full = path.resolve(entry.parentPath, entry.name);
    if (!keep.has(full)) removeDts(full, centralDir);
  }
}
