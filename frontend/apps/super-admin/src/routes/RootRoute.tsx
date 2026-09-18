import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LandingPage from '../pages/LandingPage';

/** "/" is the public landing page when logged out, or a redirect straight into the dashboard when an active super-admin session already exists. */
export default function RootRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);

  if (isAuthenticated && isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
}
