import { type ComponentType } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { LayoutDashboard, School, Package, ScrollText, LogOut, type LucideProps } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { logout as logoutApi } from '../api/auth';

const NAV_ITEMS: { to: string; label: string; icon: ComponentType<LucideProps> }[] = [
  { to: '/admin-login', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/schools', label: 'Schools', icon: School },
  { to: '/plans', label: 'Plans', icon: Package },
  { to: '/audit-log', label: 'Audit Log', icon: ScrollText },
];

export default function AdminLayout() {
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
    `flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
      isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="font-semibold text-secondary">Super Admin</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end>
              <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-sm font-medium text-secondary truncate">{fullName ?? 'Loading…'}</p>
          <p className="text-xs text-gray-400 truncate mb-2">{email}</p>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
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
