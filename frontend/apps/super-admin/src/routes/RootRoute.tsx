import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LandingPage from '../pages/LandingPage';

/** "/" is the public landing page when logged out, or a redirect straight into the right dashboard for an active session. */
export default function RootRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const activeSchoolId = useAuthStore((s) => s.activeSchoolId);

  if (isAuthenticated && isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isAuthenticated && activeSchoolId !== null) {
    return <Navigate to="/schooladmin" replace />;
  }
  return <LandingPage />;
}
