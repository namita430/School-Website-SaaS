import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { logout as logoutApi } from '../api/auth';

const NAV_SECTIONS: { label: string; items: { to: string; label: string }[] }[] = [
  { label: '', items: [{ to: '/', label: 'Dashboard' }] },
  {
    label: 'Website',
    items: [
      { to: '/website/pages', label: 'Pages' },
      { to: '/website/templates', label: 'Templates' },
      { to: '/website/navigation', label: 'Navigation' },
      { to: '/website/theme', label: 'Theme' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/content/notices', label: 'Notices' },
      { to: '/content/events', label: 'Events' },
      { to: '/content/news', label: 'News' },
      { to: '/content/teachers', label: 'Teachers' },
      { to: '/content/gallery', label: 'Gallery' },
      { to: '/content/testimonials', label: 'Testimonials' },
      { to: '/content/facilities', label: 'Facilities' },
      { to: '/content/downloads', label: 'Downloads' },
    ],
  },
  {
    label: '',
    items: [
      { to: '/media', label: 'Media Library' },
      { to: '/seo', label: 'SEO' },
      { to: '/domain', label: 'Domain' },
      { to: '/billing', label: 'Billing' },
      { to: '/users', label: 'Users & Roles' },
      { to: '/audit-log', label: 'Audit Log' },
      { to: '/settings', label: 'Settings' },
    ],
  },
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
    `block rounded-md px-3 py-1.5 text-sm transition-colors ${
      isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="h-screen flex bg-gray-50">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="font-semibold text-secondary">School Admin</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i}>
              {section.label && (
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
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
