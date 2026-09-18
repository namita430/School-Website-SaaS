import { useState } from 'react';

type Portal = 'school' | 'super';

const portalDetails: Record<Portal, { title: string; description: string; destination: string }> = {
  school: {
    title: 'School Admin',
    description: 'Manage pages, content, design, and settings for your school.',
    destination: '/admin/',
  },
  super: {
    title: 'Super Admin',
    description: 'Manage schools, plans, and platform-wide activity.',
    destination: '/super-admin/',
  },
};

/** The platform entry point shown when a public tenant does not resolve. */
export default function LandingPage() {
  const [email, setEmail] = useState('admin@schoolsaas.local');
  const [password, setPassword] = useState('SchoolSaaS!2026');
  const [pendingPortal, setPendingPortal] = useState<Portal | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(portal: Portal) {
    setError(null);
    setPendingPortal(portal);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: 'Unable to sign in.' }));
        setError(body.message ?? 'Unable to sign in.');
        return;
      }

      // The httpOnly refresh cookie lets the destination app restore this
      // session without putting an access token in the URL or browser storage.
      window.location.assign(portalDetails[portal].destination);
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setPendingPortal(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:flex sm:items-center sm:justify-center">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">School SaaS</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in to manage your school website or the whole platform.
          </p>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="platform-email">
          Email
        </label>
        <input
          id="platform-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          autoComplete="email"
        />

        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="platform-password">
          Password
        </label>
        <input
          id="platform-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          autoComplete="current-password"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 space-y-3">
          {(Object.keys(portalDetails) as Portal[]).map((portal) => {
            const details = portalDetails[portal];
            const isPending = pendingPortal === portal;
            return (
              <button
                key={portal}
                type="button"
                onClick={() => signIn(portal)}
                disabled={pendingPortal !== null}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
              >
                <span className="block text-sm font-semibold text-slate-900">
                  {isPending ? 'Signing in...' : `Continue to ${details.title}`}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{details.description}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Demo credentials are prefilled for this local environment. Replace them with your own account when ready.
        </p>
      </section>
    </main>
  );
}
