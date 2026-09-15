/** A single prop's schema, per the backend's hand-rolled convention (see
 * V4__component_registry_and_pages.sql / PageContentValidator on the backend). */
export interface PropSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
}

export interface ComponentDefinition {
  id: number;
  typeKey: string;
  name: string;
  schemaJson: { properties: Record<string, PropSchema> };
}

export interface Section {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export interface PageContent {
  sections: Section[];
}

export interface PageSummary {
  id: number;
  slug: string;
  title: string;
  isHome: boolean;
  /** SEO overrides - null means "use the site-wide default" (see SeoPage). */
  metaDescription: string | null;
  ogImageUrl: string | null;
  /** Always present - the working copy the builder edits. */
  draftContentJson: PageContent;
  /** Whether a PUBLISHED version exists - i.e. whether this page is live on the public site. */
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
