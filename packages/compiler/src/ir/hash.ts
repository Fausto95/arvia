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

/** Total length of a minified class name: one leading letter + base36 tail. */
const HASH_LEN = 8;
const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";

/** FNV-1a 64-bit (BigInt — no node built-ins, deterministic across machines),
 *  rendered as an identifier-safe token: a leading `[a-z]` (so it's always a
 *  valid CSS ident / never starts with a digit) followed by base36 chars.
 *
 *  Used for minified (production) class names. The `seed` carries file +
 *  component identity (the component's `hashName`) so names stay unique across
 *  files and components; `descriptor` carries the per-class distinguishing
 *  parts (slot / variant / value / breakpoint …). Both are path/structure
 *  based — NOT style content — so pure style edits keep names byte-identical,
 *  preserving the CSS-only HMR guarantee. */
export function hashClass(seed: string, descriptor: string): string {
  const input = `${seed}:${descriptor}`;
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < input.length; i++) {
    h ^= BigInt(input.charCodeAt(i));
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  // Leading letter from one slice of the hash; base36 tail from the rest.
  let out = BASE36[10 + Number(h % 26n)]!;
  h /= 26n;
  for (let i = 1; i < HASH_LEN; i++) {
    out += BASE36[Number(h % 36n)]!;
    h /= 36n;
  }
  return out;
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
