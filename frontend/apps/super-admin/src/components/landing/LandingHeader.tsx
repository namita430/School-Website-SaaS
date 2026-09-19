import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { NavItem } from './types';

export default function LandingHeader({
  schoolName,
  logoUrl,
  nav,
  loginUrl,
  loginLabel = 'Login',
}: {
  schoolName: string;
  logoUrl?: string | null;
  nav: NavItem[];
  loginUrl: string;
  loginLabel?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2.5 min-w-0">
          {logoUrl ? (
            <img src={logoUrl} alt={schoolName} className="h-9 w-9 rounded-theme object-cover shrink-0" />
          ) : (
            <span className="h-9 w-9 rounded-theme bg-primary text-white flex items-center justify-center font-heading font-bold shrink-0">
              {schoolName.charAt(0)}
            </span>
          )}
          <span className="font-heading font-bold text-secondary truncate">{schoolName}</span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-gray-600 hover:text-primary transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href={loginUrl}
            className="rounded-theme bg-primary text-white text-sm font-medium px-5 py-2 hover:opacity-90 transition-opacity"
          >
            {loginLabel}
          </a>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden text-secondary p-1.5"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 px-4 sm:px-6 py-4 flex flex-col gap-3 bg-white">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-600 hover:text-primary py-1"
            >
              {item.label}
            </a>
          ))}
          <a
            href={loginUrl}
            className="rounded-theme bg-primary text-white text-sm font-medium px-5 py-2.5 text-center mt-1 hover:opacity-90"
          >
            {loginLabel}
          </a>
        </nav>
      )}
    </header>
  );
}
