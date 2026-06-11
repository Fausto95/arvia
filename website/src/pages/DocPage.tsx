import { useParams, Navigate } from "react-router-dom";
import { DOCS } from "../docs/content";
import { DocContent, DocsShell } from "../components/ui";

export function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug || !DOCS[slug]) {
    return <Navigate to="/docs/introduction" replace />;
  }
  const doc = DOCS[slug];
  return (
    <DocsShell>
      <DocContent title={doc.title} description={doc.description} blocks={doc.blocks} />
    </DocsShell>
  );
}
