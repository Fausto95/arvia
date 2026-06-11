import MiniSearch from "minisearch";
import { getDocs, type DocBlock } from "./content";

function blockText(block: DocBlock): string {
  switch (block.type) {
    case "p":
    case "h2":
    case "h3":
      return block.text;
    case "ul":
      return block.items.join(" ");
    case "code":
      return [block.label, block.code].filter(Boolean).join(" ");
  }
}

function buildIndex() {
  const index = new MiniSearch({
    idField: "id",
    fields: ["title", "description", "body"],
    storeFields: ["slug", "title", "description", "body"],
  });

  index.addAll(
    Object.values(getDocs()).map((doc) => ({
      id: doc.slug,
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      body: doc.blocks.map(blockText).join(" "),
    })),
  );

  return index;
}

export type DocSearchHit = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
};

function excerpt(body: string, query: string, max = 120): string {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 1);
  const lower = body.toLowerCase();
  let index = -1;

  for (const term of terms) {
    const match = lower.indexOf(term);
    if (match !== -1) {
      index = match;
      break;
    }
  }

  if (index === -1) {
    const trimmed = body.slice(0, max);
    return trimmed + (body.length > max ? "…" : "");
  }

  const start = Math.max(0, index - 40);
  const slice = body.slice(start, start + max);
  return (start > 0 ? "…" : "") + slice + (start + max < body.length ? "…" : "");
}

export function searchDocs(query: string, limit = 8): DocSearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const index = buildIndex();

  return index
    .search(trimmed, {
      fuzzy: 0.2,
      prefix: true,
      boost: { title: 4, description: 2 },
    })
    .slice(0, limit)
    .map((result) => ({
      slug: result.slug as string,
      title: result.title as string,
      description: result.description as string,
      excerpt: excerpt(result.body as string, trimmed),
    }));
}
