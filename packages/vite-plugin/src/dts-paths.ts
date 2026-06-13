import path from "node:path";

export interface MirrorPathArgs {
  /** Absolute path of the `.arv` source file. */
  arvAbsPath: string;
  /** Absolute path of the source root the central tree mirrors (e.g. `<root>/src`). */
  sourceRoot: string;
  /** Absolute path of the central declarations directory (e.g. `<root>/.arvia/types`). */
  centralDir: string;
}

/**
 * Maps a `.arv` source file to its mirrored declaration under the central
 * directory, e.g. `src/components/stack.arv` → `.arvia/types/components/stack.arv.d.ts`.
 *
 * The mirror keeps the literal `.arv` in the filename: TypeScript reaches the
 * central dir via `rootDirs` overlay and then resolves `./stack.arv` by
 * appending `.d.ts` — so `stack.arv.d.ts` is required and `stack.d.ts` fails.
 *
 * Returns `null` when the file lives outside `sourceRoot` (no sensible mirror);
 * callers should fall back to a sibling `.d.ts`.
 */
export function mirrorPathFor({
  arvAbsPath,
  sourceRoot,
  centralDir,
}: MirrorPathArgs): string | null {
  const rel = path.relative(sourceRoot, arvAbsPath);
  // `..` segment or an absolute result means the file is not under sourceRoot.
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return path.join(centralDir, `${rel}.d.ts`);
}
