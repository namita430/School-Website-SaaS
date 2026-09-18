import { type ComponentType } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  Navigation,
  Palette,
  Megaphone,
  CalendarDays,
  Newspaper,
  Users,
  Image,
  Quote,
  Building2,
  Download,
  FolderOpen,
  Search,
  Globe,
  CreditCard,
  ShieldCheck,
  ScrollText,
  Settings,
  LogOut,
  type LucideProps,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { logout as logoutApi } from '../api/auth';

const NAV_SECTIONS: { label: string; items: { to: string; label: string; icon: ComponentType<LucideProps> }[] }[] = [
  { label: '', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Website',
    items: [
      { to: '/website/pages', label: 'Pages', icon: FileText },
      { to: '/website/navigation', label: 'Navigation', icon: Navigation },
      { to: '/website/theme', label: 'Theme', icon: Palette },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/content/notices', label: 'Notices', icon: Megaphone },
      { to: '/content/events', label: 'Events', icon: CalendarDays },
      { to: '/content/news', label: 'News', icon: Newspaper },
      { to: '/content/teachers', label: 'Teachers', icon: Users },
      { to: '/content/gallery', label: 'Gallery', icon: Image },
      { to: '/content/testimonials', label: 'Testimonials', icon: Quote },
      { to: '/content/facilities', label: 'Facilities', icon: Building2 },
      { to: '/content/downloads', label: 'Downloads', icon: Download },
    ],
  },
  {
    label: '',
    items: [
      { to: '/media', label: 'Media Library', icon: FolderOpen },
      { to: '/seo', label: 'SEO', icon: Search },
      { to: '/domain', label: 'Domain', icon: Globe },
      { to: '/billing', label: 'Billing', icon: CreditCard },
      { to: '/users', label: 'Users & Roles', icon: ShieldCheck },
      { to: '/audit-log', label: 'Audit Log', icon: ScrollText },
      { to: '/settings', label: 'Settings', icon: Settings },
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
    `flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
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
                    <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
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
