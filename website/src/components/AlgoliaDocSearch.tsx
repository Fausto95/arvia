import { DocSearch } from "@docsearch/react";
import "@docsearch/css";
import "../docsearch-theme.css";

export function AlgoliaDocSearch() {
  return (
    <DocSearch
      appId={import.meta.env.VITE_DOCSEARCH_APP_ID}
      apiKey={import.meta.env.VITE_DOCSEARCH_API_KEY}
      indexName={import.meta.env.VITE_DOCSEARCH_INDEX_NAME}
    />
  );
}
