/**
 * Everything a school landing page needs, in one shape - deliberately
 * data-only (no components import this and reach into an API themselves).
 * Today `SchoolLandingPage.tsx` fills this from `defaultSchoolLandingData`;
 * later, swap that one call site for real data (school profile, theme,
 * content modules) without touching any of the section components below.
 */
export interface NavItem {
  label: string;
  href: string;
}

export interface Highlight {
  value: string;
  label: string;
}

export interface EventItem {
  title: string;
  date?: string;
  description?: string;
}

export interface SchoolLandingData {
  schoolName: string;
  logoUrl?: string | null;
  loginUrl: string;
  nav: NavItem[];
  hero: {
    tagline: string;
    description: string;
    backgroundImageUrl?: string | null;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  about: {
    heading: string;
    body: string;
    imageUrl?: string | null;
    ctaLabel: string;
    ctaHref: string;
  };
  highlights: Highlight[];
  events: EventItem[];
  cta: {
    heading: string;
    body: string;
    buttonLabel: string;
    buttonHref: string;
  };
  footer: {
    description: string;
    quickLinks: NavItem[];
    contact: { address?: string; phone?: string; email?: string };
    social: { label: string; href: string }[];
  };
}
