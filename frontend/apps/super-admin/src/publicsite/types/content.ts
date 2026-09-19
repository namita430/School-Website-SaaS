export interface Section {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export interface PageContent {
  sections: Section[];
}

export interface PublicPage {
  slug: string;
  title: string;
  metaDescription: string | null;
  ogImageUrl: string | null;
  contentJson: PageContent;
}

export interface ThemeTokens {
  colorPrimary?: string;
  colorSecondary?: string;
  colorAccent?: string;
  colorBackground?: string;
  colorText?: string;
  fontHeading?: string;
  fontBody?: string;
  radius?: string;
  [key: string]: string | undefined;
}

export interface PublicSite {
  schoolName: string;
  schoolSlug: string;
  homePageSlug: string | null;
  themeTokens: ThemeTokens;
  faviconUrl: string | null;
  robotsIndexable: boolean;
}
