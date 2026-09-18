import type { SchoolLandingData } from '../components/landing/types';
import { defaultSchoolLandingData } from '../components/landing/defaultSchoolLandingData';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import HighlightsSection from '../components/landing/HighlightsSection';
import EventsSection from '../components/landing/EventsSection';
import CtaSection from '../components/landing/CtaSection';
import LandingFooter from '../components/landing/LandingFooter';

/**
 * A school's public landing page, assembled from small reusable sections
 * (components/landing/*) driven entirely by a `SchoolLandingData` object -
 * see types.ts. Takes `data` so a future integration can pass real content
 * (school profile, theme colors/fonts, notices/events) instead of
 * `defaultSchoolLandingData`; every section component is presentational and
 * doesn't know or care where its props came from.
 */
export default function SchoolLandingPage({ data = defaultSchoolLandingData }: { data?: SchoolLandingData }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-body">
      <LandingHeader schoolName={data.schoolName} logoUrl={data.logoUrl} nav={data.nav} loginUrl={data.loginUrl} />
      <HeroSection schoolName={data.schoolName} hero={data.hero} />
      <AboutSection about={data.about} />
      <HighlightsSection highlights={data.highlights} />
      <EventsSection events={data.events} />
      <CtaSection cta={data.cta} />
      <LandingFooter schoolName={data.schoolName} logoUrl={data.logoUrl} footer={data.footer} />
    </div>
  );
}
