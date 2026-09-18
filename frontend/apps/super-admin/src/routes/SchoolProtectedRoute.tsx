import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/** Gate for the /schooladmin/* subtree - any authenticated user with at least one school membership. */
export default function SchoolProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeSchoolId = useAuthStore((s) => s.activeSchoolId);
  if (!isAuthenticated || activeSchoolId === null) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
