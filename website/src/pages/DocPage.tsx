import { useParams, Navigate } from "react-router-dom";
import { getDocs } from "../docs/content";
import { DocContent, DocsShell } from "../components/ui";

export function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  const docs = getDocs();
  if (!slug || !docs[slug]) {
    return <Navigate to="/docs/introduction" replace />;
  }
  const doc = docs[slug];
  return (
    <DocsShell>
      <DocContent title={doc.title} description={doc.description} blocks={doc.blocks} />
    </DocsShell>
  );
}
