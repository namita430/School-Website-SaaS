import { Outlet, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { logout as logoutApi } from '../api/auth';

/**
 * Read-only portal - the STUDENT role (V14) only has WEBSITE_VIEW, so
 * there's nothing to navigate to besides the one dashboard; no sidebar nav
 * list like Teacher's, just a header with sign-out.
 */
export default function StudentLayout() {
  const navigate = useNavigate();
  const fullName = useAuthStore((s) => s.fullName);
  const clearSession = useAuthStore((s) => s.clearSession);

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearSession();
      navigate('/login', { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <p className="font-semibold text-secondary">Student Portal</p>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{fullName}</p>
          <button onClick={() => logoutMutation.mutate()} className="text-xs text-gray-500 hover:text-red-600">
            Sign out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
