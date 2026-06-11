/** FNV-1a 32-bit, rendered base36 and sliced to 6 chars.
 *  Hashed over `relativePath:componentName` — NOT over content — so that
 *  pure style edits keep class names (and therefore the generated JS and
 *  d.ts) byte-identical, enabling CSS-only HMR updates. */
export function hashName(relativePath: string, componentName: string): string {
  const input = `${relativePath}:${componentName}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(7, "0").slice(0, 6);
}

/** Posix-normalizes `filename` and strips the `root` prefix when present.
 *  Pure string manipulation: the compiler stays free of node built-ins. */
export function relativeName(filename: string, root?: string): string {
  const norm = filename.replace(/\\/g, "/");
  if (root) {
    const normRoot = root.replace(/\\/g, "/").replace(/\/$/, "");
    if (norm.startsWith(normRoot + "/")) {
      return norm.slice(normRoot.length + 1);
    }
  }
  return norm;
}
