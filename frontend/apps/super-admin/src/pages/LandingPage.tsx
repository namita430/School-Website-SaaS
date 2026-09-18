import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TABS = ['Home', 'About'] as const;
type Tab = (typeof TABS)[number];

const TAB_CONTENT: Record<Tab, { heading: string; body: string }> = {
  Home: {
    heading: "Everything your school's website needs, in one platform",
    body: 'A website builder, content management, and staff/family portals built specifically for schools - up and running in minutes, not months.',
  },
  About: {
    heading: 'About School SaaS',
    body: 'School SaaS gives every school its own website, content management system, and role-based staff/family portals, all managed from one admin dashboard. More detail coming soon.',
  },
};

/**
 * Public, unauthenticated landing page for the platform - shown at "/" when
 * no session is active (see RootRoute). Deliberately minimal for now (two
 * placeholder tabs, no real marketing content yet) - the point of this pass
 * is the Login entry point and the credential-based dashboard routing, not
 * final copy/design.
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('Home');
  const content = TAB_CONTENT[tab];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-lg text-secondary">School SaaS</span>
          <nav className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
          <button
            onClick={() => navigate('/login')}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-2 hover:opacity-90"
          >
            Login
          </button>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">{content.heading}</h1>
        <p className="text-lg text-gray-500 mb-8">{content.body}</p>
        <button
          onClick={() => navigate('/login')}
          className="rounded-md bg-primary text-white text-sm font-medium px-6 py-3 hover:opacity-90"
        >
          Login
        </button>
      </section>
    </div>
  );
}
