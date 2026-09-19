const SCHOOL_ADMIN_URL = import.meta.env.VITE_APP_URL ?? '';

const FEATURES = [
  { title: 'Visual website builder', body: 'Drag-and-drop pages with a structured, themeable component system - no code required.' },
  { title: 'School CMS', body: 'Notices, events, news, staff, gallery, testimonials, facilities, and downloads - all built in.' },
  { title: 'Staff & family portals', body: 'Dedicated, permission-scoped views for teachers, students, and parents.' },
  { title: 'Custom domains', body: 'Launch on a free subdomain, then move to your own domain when ready.' },
];

/**
 * The platform's own marketing/entry page - shown when no school subdomain
 * resolves (bare host, e.g. yoursaas.com or localhost in dev). Every other
 * route in this app is a specific school's public site; this one belongs to
 * the platform itself, so it deliberately doesn't use SiteContext/useSite().
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-lg text-secondary">School SaaS</span>
          <a
            href={`${SCHOOL_ADMIN_URL}/super-admin/login`}
            className="rounded-md bg-primary text-white text-sm font-medium px-4 py-2 hover:opacity-90"
          >
            Login
          </a>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">
          Everything your school's website needs, in one platform
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          A website builder, content management, and staff/family portals built specifically for schools -
          up and running in minutes, not months.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href={`${SCHOOL_ADMIN_URL}/super-admin/login`}
            className="rounded-md bg-primary text-white text-sm font-medium px-6 py-3 hover:opacity-90"
          >
            Login to your dashboard
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-lg p-6">
              <p className="font-semibold text-secondary mb-1">{f.title}</p>
              <p className="text-sm text-gray-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Already have a school site? Visit your school's own address to see it live.
      </footer>
    </div>
  );
}
