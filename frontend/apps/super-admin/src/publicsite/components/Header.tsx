import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getNavigation } from '../api/nav';
import { SiteContext } from '../context/SiteContext';
import { platformUrl } from '../lib/hosts';


/**
 * The persistent site-wide header - present on every route, unlike the
 * navbar builder block (NavbarBlock) which is only an optional per-page
 * content section. This is what actually makes the site "browsable": links
 * come from PublicSiteService.getNavigation(), which is either the school's
 * configured nav (School Admin -> Navigation) or, if that's empty, every
 * published page automatically.
 */
export default function Header() {
  const site = useContext(SiteContext);
  const navQuery = useQuery({ queryKey: ['public-nav'], queryFn: getNavigation, retry: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const links = navQuery.data ?? [];

  const isExternal = (url: string) => /^https?:\/\//.test(url);

  return (
    <header className="border-b border-gray-100 bg-site-bg/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-heading font-semibold text-lg text-site-text truncate">
          {site?.schoolName ?? 'Home'}
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {links.map((link, i) =>
            isExternal(link.url) ? (
              <a key={i} href={link.url} className="text-sm text-site-text/70 hover:text-primary">
                {link.label}
              </a>
            ) : (
              <Link key={i} to={link.url} className="text-sm text-site-text/70 hover:text-primary">
                {link.label}
              </Link>
            ),
          )}
          <a
            href={platformUrl('/login')}
            className="rounded-md border border-gray-200 text-sm text-site-text/80 px-3 py-1.5 hover:border-primary hover:text-primary"
          >
            Staff Login
          </a>
        </nav>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden text-sm text-site-text/70 border border-gray-200 rounded-md px-3 py-1.5"
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <nav className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          {links.map((link, i) =>
            isExternal(link.url) ? (
              <a key={i} href={link.url} className="text-sm text-site-text/80" onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ) : (
              <Link key={i} to={link.url} className="text-sm text-site-text/80" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ),
          )}
          <a href={platformUrl('/login')} className="text-sm text-site-text/80" onClick={() => setMenuOpen(false)}>
            Staff Login
          </a>
        </nav>
      )}
    </header>
  );
}
