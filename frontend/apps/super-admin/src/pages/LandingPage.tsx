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
 * The platform's own public landing page (shown at "/" when logged out -
 * see RootRoute.tsx), assembled from the same small reusable section
 * components as the per-school landing template in the public-site app
 * (components/landing/*, kept in sync structurally). Driven by
 * `defaultSchoolLandingData` for now; swap that for real platform-level
 * copy/branding whenever it's ready - no section component needs to change.
 */
export default function LandingPage({ data = defaultSchoolLandingData }: { data?: SchoolLandingData }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
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
