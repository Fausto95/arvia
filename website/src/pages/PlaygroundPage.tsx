import { Playground } from "../components/Playground";
import { Heading, Page, Text } from "../components/ui";
import { getThemeEnv } from "../playground/theme-env";
import { TEMPLATE_GROUPS } from "../playground/templates";

export function PlaygroundPage() {
  const page = Page();
  return (
    <div className={page.root}>
      <header style={{ marginBottom: 32 }}>
        <h1 className={Heading({ level: "h1" }).root}>Playground</h1>
        <p className={Text({ tone: "muted", size: "lg" }).root}>
          Edit the <code>.arv</code> or <code>App.tsx</code> — the preview, CSS, and types compile
          live in your browser. Load any demo from the select.
        </p>
      </header>
      <Playground height={520} env={getThemeEnv()} templates={TEMPLATE_GROUPS} />
    </div>
  );
}
