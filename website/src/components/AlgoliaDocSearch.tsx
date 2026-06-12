import { DocSearch } from "@docsearch/react";
import "@docsearch/css";
import "../docsearch-theme.css";

export function AlgoliaDocSearch() {
  // Callers gate on isAlgoliaDocSearchEnabled(), but TS can't narrow across
  // components — re-check here so the values type as string.
  const appId = import.meta.env.VITE_DOCSEARCH_APP_ID;
  const apiKey = import.meta.env.VITE_DOCSEARCH_API_KEY;
  const indexName = import.meta.env.VITE_DOCSEARCH_INDEX_NAME;
  if (!appId || !apiKey || !indexName) return null;
  return <DocSearch appId={appId} apiKey={apiKey} indexName={indexName} />;
}
