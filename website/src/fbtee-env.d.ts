/// <reference types="fbtee/ReactTypes.d.ts" />

interface ImportMetaEnv {
  readonly VITE_DOCSEARCH_APP_ID?: string;
  readonly VITE_DOCSEARCH_API_KEY?: string;
  readonly VITE_DOCSEARCH_INDEX_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
