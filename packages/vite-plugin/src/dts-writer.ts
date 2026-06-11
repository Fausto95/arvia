import fs from "node:fs";

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
  fs.writeFileSync(dtsPath, content);
}

/** Debounced sibling-declaration write, used by the dev server. */
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
