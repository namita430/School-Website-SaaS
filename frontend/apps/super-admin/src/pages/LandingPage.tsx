import type { SchoolLandingData } from '../components/landing/types';
import { defaultSchoolLandingData } from '../components/landing/defaultSchoolLandingData';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import HighlightsSection from '../components/landing/HighlightsSection';
import EventsSection from '../components/landing/EventsSection';
import CtaSection from '../components/landing/CtaSection';
import LandingFooter from '../components/landing/LandingFooter';
import { useAuthStore } from '../store/authStore';

/**
 * The platform's own public landing page, shown at "/" (see RootRoute.tsx)
 * whether or not a session is active. Assembled from small reusable section
 * components driven by `defaultSchoolLandingData`; swap that for real
 * platform-level copy/branding whenever it's ready - no section component
 * needs to change. When someone is already signed in, the nav's Login button
 * becomes a Dashboard button pointing at their own dashboard.
 */
export default function LandingPage({ data = defaultSchoolLandingData }: { data?: SchoolLandingData }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const activeSchoolId = useAuthStore((s) => s.activeSchoolId);

  const dashboardUrl = isSuperAdmin ? '/dashboard' : activeSchoolId !== null ? '/schooladmin' : null;
  const signedIn = isAuthenticated && dashboardUrl !== null;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingHeader
        schoolName={data.schoolName}
        logoUrl={data.logoUrl}
        nav={data.nav}
        loginUrl={signedIn ? dashboardUrl : data.loginUrl}
        loginLabel={signedIn ? 'Dashboard' : 'Login'}
      />
      <HeroSection schoolName={data.schoolName} hero={data.hero} />
      <AboutSection about={data.about} />
      <HighlightsSection highlights={data.highlights} />
      <EventsSection events={data.events} />
      <CtaSection cta={data.cta} />
      <LandingFooter schoolName={data.schoolName} logoUrl={data.logoUrl} footer={data.footer} />
    </div>
  );
}
