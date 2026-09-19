import type { ComponentType } from 'react';
import NavbarBlock from './NavbarBlock';
import HeroBlock from './HeroBlock';
import HeadingBlock from './HeadingBlock';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import AboutBlock from './AboutBlock';
import CtaBlock from './CtaBlock';
import NoticeBoardBlock from './NoticeBoardBlock';
import FooterBlock from './FooterBlock';
import EventsBlock from './EventsBlock';
import NewsBlock from './NewsBlock';
import TeachersBlock from './TeachersBlock';
import GalleryBlock from './GalleryBlock';
import TestimonialsBlock from './TestimonialsBlock';
import FacilitiesBlock from './FacilitiesBlock';
import DownloadsBlock from './DownloadsBlock';

export interface BlockProps {
  props: Record<string, unknown>;
}

/**
 * Maps a component's type_key (from the backend's component registry, see
 * Phase 4) to the React component that renders it. This is the frontend
 * half of the "extensible component system" - the backend registry says
 * WHAT props a component takes, this registry says HOW to render it.
 * Adding a new component type requires a new entry here (a code change,
 * unlike the backend registry) - that's expected: rendering genuinely needs
 * bespoke markup per component, unlike prop validation which is generic.
 *
 * The 7 Phase 8 content blocks (events/news/teachers/gallery/testimonials/
 * facilities/downloads) each fetch their own data from the matching
 * /api/v1/public/<type> endpoint - see api/content.ts.
 */
export const COMPONENT_REGISTRY: Record<string, ComponentType<BlockProps>> = {
  navbar: NavbarBlock,
  hero: HeroBlock,
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  about: AboutBlock,
  cta: CtaBlock,
  notice_board: NoticeBoardBlock,
  footer: FooterBlock,
  events: EventsBlock,
  news: NewsBlock,
  teachers: TeachersBlock,
  gallery: GalleryBlock,
  testimonials: TestimonialsBlock,
  facilities: FacilitiesBlock,
  downloads: DownloadsBlock,
};
