export type FieldType = 'text' | 'textarea' | 'date' | 'checkbox' | 'url';

export interface ContentField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
}

export interface ContentModuleConfig {
  slug: string;
  title: string;
  apiPath: string;
  /** Which field to show as the row's primary label in the list. */
  titleField: string;
  fields: ContentField[];
}

/**
 * One config entry per Phase 8 content module, driving a single generic
 * list+form page (ContentPage.tsx) instead of 8 near-identical hand-written
 * pages - mirrors the backend's one-file-per-module consolidation for the
 * same reason: these 8 modules are structurally identical CRUD that differ
 * only in field shape.
 */
export const CONTENT_MODULES: Record<string, ContentModuleConfig> = {
  notices: {
    slug: 'notices',
    title: 'Notices',
    apiPath: '/api/v1/notices',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'noticeDate', label: 'Date', type: 'date' },
      { key: 'pinned', label: 'Pinned', type: 'checkbox' },
    ],
  },
  events: {
    slug: 'events',
    title: 'Events',
    apiPath: '/api/v1/events',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'eventDate', label: 'Date', type: 'date' },
      { key: 'location', label: 'Location', type: 'text' },
    ],
  },
  news: {
    slug: 'news',
    title: 'News',
    apiPath: '/api/v1/news',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'publishedDate', label: 'Published date', type: 'date' },
    ],
  },
  teachers: {
    slug: 'teachers',
    title: 'Teachers',
    apiPath: '/api/v1/teachers',
    titleField: 'name',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'designation', label: 'Designation', type: 'text' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'photoUrl', label: 'Photo URL', type: 'url' },
    ],
  },
  gallery: {
    slug: 'gallery',
    title: 'Gallery',
    apiPath: '/api/v1/gallery',
    titleField: 'caption',
    fields: [
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
    ],
  },
  testimonials: {
    slug: 'testimonials',
    title: 'Testimonials',
    apiPath: '/api/v1/testimonials',
    titleField: 'authorName',
    fields: [
      { key: 'authorName', label: 'Author name', type: 'text', required: true },
      { key: 'authorRole', label: 'Author role', type: 'text' },
      { key: 'quote', label: 'Quote', type: 'textarea', required: true },
      { key: 'photoUrl', label: 'Photo URL', type: 'url' },
    ],
  },
  facilities: {
    slug: 'facilities',
    title: 'Facilities',
    apiPath: '/api/v1/facilities',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'imageUrl', label: 'Image URL', type: 'url' },
    ],
  },
  downloads: {
    slug: 'downloads',
    title: 'Downloads',
    apiPath: '/api/v1/downloads',
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'fileUrl', label: 'File URL', type: 'url', required: true },
      { key: 'category', label: 'Category', type: 'text' },
    ],
  },
};
