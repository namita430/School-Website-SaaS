import { Outlet, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { logout as logoutApi } from '../api/auth';

/**
 * Same shape as StudentLayout (read-only, header-only, no sidebar) - the
 * PARENT role (V15) is also WEBSITE_VIEW-only. Kept as a separate component
 * rather than reusing StudentLayout directly so the two portals can diverge
 * later (e.g. a parent's dashboard eventually showing their specific
 * children, once a parent-student link data model exists) without one
 * role's changes accidentally affecting the other.
 */
export default function ParentLayout() {
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
        <p className="font-semibold text-secondary">Parent Portal</p>
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
