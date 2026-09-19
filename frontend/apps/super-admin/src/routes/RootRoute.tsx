import LandingPage from '../pages/LandingPage';

/** "/" is always the landing page, even when a session is active - the nav button then becomes "Dashboard" (see LandingPage). */
export default function RootRoute() {
  return <LandingPage />;
}
