import type { ComponentType, ReactNode } from "react";

export type DocNavSection =
  | "getting-started"
  | "frameworks"
  | "tutorial"
  | "language"
  | "api"
  | "deep-dives"
  | "tooling"
  | "migrate";

export type DocPageMeta = {
  slug: string;
  title: ReactNode;
  description: ReactNode;
  nav: { section: DocNavSection; order: number };
  searchText: string;
};

export type DocPageEntry = {
  meta: DocPageMeta;
  Page: ComponentType;
};

import { ApiCompilerPage, api_compilerMeta } from "./pages/api-compiler";
import { ApiRuntimePage, api_runtimeMeta } from "./pages/api-runtime";
import { CliPage, cliMeta } from "./pages/cli";
import { CompilationPage, compilationMeta } from "./pages/compilation";
import { ComponentsPage, componentsMeta } from "./pages/components";
import { CompoundPage, compoundMeta } from "./pages/compound";
import { ContainerQueriesPage, container_queriesMeta } from "./pages/container-queries";
import { DiagnosticsPage, diagnosticsMeta } from "./pages/diagnostics";
import { FaqPage, faqMeta } from "./pages/faq";
import { FromCssModulesPage, from_css_modulesMeta } from "./pages/from-css-modules";
import { FromTailwindPage, from_tailwindMeta } from "./pages/from-tailwind";
import { FromVanillaExtractPage, from_vanilla_extractMeta } from "./pages/from-vanilla-extract";
import { GlobalPage, globalMeta } from "./pages/global";
import { InstallationPage, installationMeta } from "./pages/installation";
import { IntroductionPage, introductionMeta } from "./pages/introduction";
import { KeyframesPage, keyframesMeta } from "./pages/keyframes";
import { LanguageServerPage, language_serverMeta } from "./pages/language-server";
import { LocalTokensPage, local_tokensMeta } from "./pages/local-tokens";
import { PackagesPage, packagesMeta } from "./pages/packages";
import { PatternsPage, patternsMeta } from "./pages/patterns";
import { PreactPage, preactMeta } from "./pages/preact";
import { QuickStartPage, quick_startMeta } from "./pages/quick-start";
import { ReactPage, reactMeta } from "./pages/react";
import { RecipesPage, recipesMeta } from "./pages/recipes";
import { ResponsivePage, responsiveMeta } from "./pages/responsive";
import { SlotsPage, slotsMeta } from "./pages/slots";
import { StatesPage, statesMeta } from "./pages/states";
import { StorybookPage, storybookMeta } from "./pages/storybook";
import { StylesPage, stylesMeta } from "./pages/styles";
import { ThemeModesPage, theme_modesMeta } from "./pages/theme-modes";
import { ThemePage, themeMeta } from "./pages/theme";
import { ThinkingInArviaPage, thinking_in_arviaMeta } from "./pages/thinking-in-arvia";
import { TokenDocsPage, token_docsMeta } from "./pages/token-docs";
import { TutorialPage, tutorialMeta } from "./pages/tutorial";
import { TutorialButtonPage, tutorial_buttonMeta } from "./pages/tutorial-button";
import { TutorialComposePage, tutorial_composeMeta } from "./pages/tutorial-compose";
import { TutorialSlotsPage, tutorial_slotsMeta } from "./pages/tutorial-slots";
import { TutorialStatesPage, tutorial_statesMeta } from "./pages/tutorial-states";
import { TutorialThemePage, tutorial_themeMeta } from "./pages/tutorial-theme";
import { TutorialVariantsPage, tutorial_variantsMeta } from "./pages/tutorial-variants";
import { TypecheckPage, typecheckMeta } from "./pages/typecheck";
import { VariantsPage, variantsMeta } from "./pages/variants";
import { VitePluginPage, vite_pluginMeta } from "./pages/vite-plugin";
import { VuePage, vueMeta } from "./pages/vue";

const SECTION_LABELS: Record<DocNavSection, ReactNode> = {
  "getting-started": <fbt desc="Docs sidebar section title">{"Getting started"}</fbt>,
  frameworks: <fbt desc="Docs sidebar section title">{"Frameworks"}</fbt>,
  tutorial: <fbt desc="Docs sidebar section title">{"Tutorial"}</fbt>,
  language: <fbt desc="Docs sidebar section title">{"Language"}</fbt>,
  api: <fbt desc="Docs sidebar section title">{"API reference"}</fbt>,
  "deep-dives": <fbt desc="Docs sidebar section title">{"Deep dives"}</fbt>,
  migrate: <fbt desc="Docs sidebar section title">{"Migrate"}</fbt>,
  tooling: <fbt desc="Docs sidebar section title">{"Tooling"}</fbt>,
};

export const docPages: DocPageEntry[] = [
  { meta: api_compilerMeta, Page: ApiCompilerPage },
  { meta: api_runtimeMeta, Page: ApiRuntimePage },
  { meta: cliMeta, Page: CliPage },
  { meta: compilationMeta, Page: CompilationPage },
  { meta: componentsMeta, Page: ComponentsPage },
  { meta: compoundMeta, Page: CompoundPage },
  { meta: container_queriesMeta, Page: ContainerQueriesPage },
  { meta: diagnosticsMeta, Page: DiagnosticsPage },
  { meta: faqMeta, Page: FaqPage },
  { meta: from_css_modulesMeta, Page: FromCssModulesPage },
  { meta: from_tailwindMeta, Page: FromTailwindPage },
  { meta: from_vanilla_extractMeta, Page: FromVanillaExtractPage },
  { meta: globalMeta, Page: GlobalPage },
  { meta: installationMeta, Page: InstallationPage },
  { meta: introductionMeta, Page: IntroductionPage },
  { meta: keyframesMeta, Page: KeyframesPage },
  { meta: language_serverMeta, Page: LanguageServerPage },
  { meta: local_tokensMeta, Page: LocalTokensPage },
  { meta: packagesMeta, Page: PackagesPage },
  { meta: patternsMeta, Page: PatternsPage },
  { meta: preactMeta, Page: PreactPage },
  { meta: quick_startMeta, Page: QuickStartPage },
  { meta: reactMeta, Page: ReactPage },
  { meta: recipesMeta, Page: RecipesPage },
  { meta: responsiveMeta, Page: ResponsivePage },
  { meta: slotsMeta, Page: SlotsPage },
  { meta: statesMeta, Page: StatesPage },
  { meta: storybookMeta, Page: StorybookPage },
  { meta: stylesMeta, Page: StylesPage },
  { meta: theme_modesMeta, Page: ThemeModesPage },
  { meta: themeMeta, Page: ThemePage },
  { meta: thinking_in_arviaMeta, Page: ThinkingInArviaPage },
  { meta: token_docsMeta, Page: TokenDocsPage },
  { meta: tutorialMeta, Page: TutorialPage },
  { meta: tutorial_buttonMeta, Page: TutorialButtonPage },
  { meta: tutorial_composeMeta, Page: TutorialComposePage },
  { meta: tutorial_slotsMeta, Page: TutorialSlotsPage },
  { meta: tutorial_statesMeta, Page: TutorialStatesPage },
  { meta: tutorial_themeMeta, Page: TutorialThemePage },
  { meta: tutorial_variantsMeta, Page: TutorialVariantsPage },
  { meta: typecheckMeta, Page: TypecheckPage },
  { meta: variantsMeta, Page: VariantsPage },
  { meta: vite_pluginMeta, Page: VitePluginPage },
  { meta: vueMeta, Page: VuePage },
];

export const docBySlug: Record<string, DocPageEntry> = Object.fromEntries(
  docPages.map((entry) => [entry.meta.slug, entry]),
);

const SECTION_ORDER: DocNavSection[] = [
  "getting-started",
  "frameworks",
  "tutorial",
  "language",
  "api",
  "deep-dives",
  "tooling",
  "migrate",
];

export function getDocNav() {
  const sections = new Map<
    DocNavSection,
    { section: ReactNode; items: { title: ReactNode; slug: string; order: number }[] }
  >();
  for (const { meta } of docPages) {
    const label = SECTION_LABELS[meta.nav.section];
    if (!sections.has(meta.nav.section)) {
      sections.set(meta.nav.section, { section: label, items: [] });
    }
    sections.get(meta.nav.section)!.items.push({
      title: meta.title,
      slug: meta.slug,
      order: meta.nav.order,
    });
  }
  return SECTION_ORDER.filter((key) => sections.has(key)).map((key) => {
    const group = sections.get(key)!;
    return {
      section: group.section,
      items: group.items
        .toSorted((a, b) => a.order - b.order)
        .map(({ title, slug }) => ({ title, slug })),
    };
  });
}

export function getFlatDocNav() {
  return getDocNav().flatMap((group) => group.items);
}
