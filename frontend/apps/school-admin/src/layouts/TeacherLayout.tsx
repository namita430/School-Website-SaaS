import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { logout as logoutApi } from '../api/auth';

/**
 * A deliberately restricted layout for TEACHER-role users - no billing,
 * domain, theme, media, users, or page-builder access, matching the scope
 * agreed with the user (view/manage notices and events only). Reuses the
 * same generic ContentPage the full admin app uses for notices/events -
 * the backend's permission check (NOTICE_CREATE/EDIT, EVENT_CREATE/EDIT,
 * granted to TEACHER in V13) is what actually enforces the restriction;
 * this layout just doesn't offer navigation to anything a teacher can't do.
 */
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/content/notices', label: 'Notices' },
  { to: '/content/events', label: 'Events' },
];

export default function TeacherLayout() {
  const navigate = useNavigate();
  const fullName = useAuthStore((s) => s.fullName);
  const email = useAuthStore((s) => s.email);
  const clearSession = useAuthStore((s) => s.clearSession);

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearSession();
      navigate('/login', { replace: true });
    },
  });

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-1.5 text-sm transition-colors ${
      isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="font-semibold text-secondary">Teacher Portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-sm font-medium text-secondary truncate">{fullName ?? 'Loading…'}</p>
          <p className="text-xs text-gray-400 truncate mb-2">{email}</p>
          <button
            onClick={() => logoutMutation.mutate()}
            className="text-xs text-gray-500 hover:text-red-600"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
