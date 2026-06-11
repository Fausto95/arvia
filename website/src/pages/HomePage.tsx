import { FeatureGrid, Page, SiteHero } from "../components/ui";

export function HomePage() {
  const page = Page();
  return (
    <div>
      <SiteHero />
      <div className={page.root}>
        <FeatureGrid />
      </div>
    </div>
  );
}
