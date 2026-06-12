import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { InlineCode, proseLink } from "./layout.arv";

/** `code` spans and [text](/docs/slug) or [text](https://…) links inside docs prose. */
const INLINE_RE = /`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^()\s]+|\/[^()\s]+)\)/g;

/** Renders docs prose, turning `backtick` spans into inline code and
 *  [text](/path) into router links (external URLs open in a new tab).
 *  Plain strings pass through untouched. */
export function renderInline(value: string): ReactNode {
  const text = String(value);
  if (!text.includes("`") && !text.includes("](")) {
    return text;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <code key={index} className={InlineCode().root}>
          {match[1]}
        </code>,
      );
    } else {
      const href = match[3]!;
      if (href.startsWith("http")) {
        nodes.push(
          <a key={index} className={proseLink} href={href} target="_blank" rel="noopener noreferrer">
            {match[2]}
          </a>,
        );
      } else {
        nodes.push(
          <Link key={index} className={proseLink} to={href}>
            {match[2]}
          </Link>,
        );
      }
    }
    cursor = index + match[0].length;
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

/** Stable anchor ids for docs headings, shared by DocContent and the TOC. */
export function headingId(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
