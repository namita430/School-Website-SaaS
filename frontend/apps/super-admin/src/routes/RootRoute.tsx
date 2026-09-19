import LandingPage from '../pages/LandingPage';

/** "/" is always the landing page, even when a session is already active. */
export default function RootRoute() {
  return <LandingPage />;
}
