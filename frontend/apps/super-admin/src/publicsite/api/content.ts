import { apiFetch } from './client';

export interface Notice {
  id: number;
  title: string;
  body: string | null;
  noticeDate: string | null;
  pinned: boolean;
}
export interface EventItem {
  id: number;
  title: string;
  description: string | null;
  eventDate: string | null;
  location: string | null;
}
export interface NewsItem {
  id: number;
  title: string;
  body: string | null;
  publishedDate: string | null;
}
export interface Teacher {
  id: number;
  name: string;
  designation: string | null;
  bio: string | null;
  photoUrl: string | null;
}
export interface GalleryItem {
  id: number;
  caption: string | null;
  imageUrl: string;
}
export interface Testimonial {
  id: number;
  authorName: string;
  authorRole: string | null;
  quote: string;
  photoUrl: string | null;
}
export interface Facility {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
}
export interface DownloadItem {
  id: number;
  title: string;
  fileUrl: string;
  category: string | null;
}

/** Generic fetch for any of the 8 public content-list endpoints - see contentConfig on the school-admin side for the equivalent write path. */
export function getContentList<T>(apiPath: string, limit?: number): Promise<T[]> {
  const query = limit ? `?limit=${limit}` : '';
  return apiFetch<T[]>(`${apiPath}${query}`);
}
