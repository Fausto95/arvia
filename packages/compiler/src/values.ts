import type { RawValue, ValueWord } from "./ast/nodes.js";
import { cssVarName, type ThemeEnv } from "./ir/ir.js";

export type RefWord = Extract<ValueWord, { kind: "ref" }>;

function resolveTokenLiteral(
  group: string,
  name: string,
  tokens: ThemeEnv["tokens"],
  mode: string | null,
  modes: string[] | null,
  onUnknownToken?: (word: RefWord) => void,
  word?: RefWord,
): string | undefined {
  const bucket = tokens[group];
  if (!bucket) return undefined;
  const entry = bucket[name];
  if (entry === undefined) {
    if (word) onUnknownToken?.(word);
    return undefined;
  }
  if (typeof entry === "string") return entry;
  const key = mode ?? modes?.[0];
  return (key && entry[key]) ?? entry[modes?.[0] ?? ""] ?? Object.values(entry)[0];
}

/** Component-scoped tokens: group → name → literal value. */
export type LocalTokens = Record<string, Record<string, string>>;

/**
 * Returns the value text with theme token refs replaced by their values.
 * When `modes` is set, known token refs become `var(--arvia-<group>-<name>)`.
 * `keyframes.name` refs resolve to hashed CSS animation names.
 * `localTokens` (component-scoped) shadow theme tokens and always inline to
 * literals — they are compile-time constants, never CSS variables.
 */
export function substituteRefs(
  value: RawValue,
  env: Pick<ThemeEnv, "tokens" | "modes" | "keyframes">,
  onUnknownToken?: (word: RefWord) => void,
  localTokens?: LocalTokens | null,
): string {
  const refs = value.words
    .filter((word): word is RefWord => word.kind === "ref")
    .toSorted((a, b) => b.span.start - a.span.start);

  let text = value.text;
  for (const word of refs) {
    let resolved: string | undefined;
    const local = word.group === "keyframes" ? undefined : localTokens?.[word.group]?.[word.name];
    if (local !== undefined) {
      resolved = local;
    } else if (word.group === "keyframes") {
      resolved = env.keyframes[word.name];
      if (resolved === undefined) onUnknownToken?.(word);
    } else if (env.modes) {
      const bucket = env.tokens[word.group];
      if (bucket && bucket[word.name] !== undefined) {
        resolved = `var(${cssVarName(word.group, word.name)})`;
      } else {
        onUnknownToken?.(word);
      }
    } else {
      resolved = resolveTokenLiteral(
        word.group,
        word.name,
        env.tokens,
        null,
        null,
        onUnknownToken,
        word,
      );
    }
    if (resolved === undefined) continue;
    const offset = word.span.start - value.span.start;
    text = text.slice(0, offset) + resolved + text.slice(offset + word.text.length);
  }
  return text;
}

/** Inlines token refs to literal values for a specific theme mode (CSS var definitions). */
export function substituteRefsForMode(
  value: RawValue,
  tokens: ThemeEnv["tokens"],
  mode: string,
  modes: string[] | null,
  onUnknownToken?: (word: RefWord) => void,
): string {
  const refs = value.words
    .filter((word): word is RefWord => word.kind === "ref")
    .toSorted((a, b) => b.span.start - a.span.start);

  let text = value.text;
  for (const word of refs) {
    if (word.group === "keyframes") continue;
    const resolved = resolveTokenLiteral(
      word.group,
      word.name,
      tokens,
      mode,
      modes,
      onUnknownToken,
      word,
    );
    if (resolved === undefined) continue;
    const offset = word.span.start - value.span.start;
    text = text.slice(0, offset) + resolved + text.slice(offset + word.text.length);
  }
  return text;
}
