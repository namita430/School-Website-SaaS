import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/** "/" sends an active session to its own dashboard, and everyone else to the login page. */
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
  return <Navigate to="/login" replace />;
}
