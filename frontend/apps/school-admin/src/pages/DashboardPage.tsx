import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMySchool } from '../api/school';
import { listContent } from '../api/content';
import { listPages } from '../api/pages';
import { listMedia } from '../api/media';
import { CONTENT_MODULES } from '../features/content/contentConfig';

const CHART_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${accent ?? 'text-secondary'}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
      <p className="text-sm font-medium text-secondary mb-4">{title}</p>
      {children}
    </div>
  );
}

const moduleEntries = Object.values(CONTENT_MODULES);

export default function DashboardPage() {
  const schoolQuery = useQuery({ queryKey: ['schools', 'me'], queryFn: getMySchool });

  const contentQueries = useQueries({
    queries: moduleEntries.map((m) => ({
      queryKey: ['content', m.slug, 'dashboard'],
      queryFn: () => listContent(m.apiPath),
    })),
  });

  const pagesQuery = useQuery({ queryKey: ['pages', 'dashboard'], queryFn: listPages });
  const mediaQuery = useQuery({ queryKey: ['media', 'dashboard'], queryFn: listMedia });

  const isLoading =
    schoolQuery.isLoading || pagesQuery.isLoading || mediaQuery.isLoading || contentQueries.some((q) => q.isLoading);
  const isError =
    schoolQuery.isError || pagesQuery.isError || mediaQuery.isError || contentQueries.some((q) => q.isError);

  const moduleCounts = useMemo(
    () =>
      moduleEntries.map((m, i) => ({
        slug: m.slug,
        title: m.title,
        count: contentQueries[i].data?.length ?? 0,
      })),
    [contentQueries],
  );

  const teacherCount = moduleCounts.find((m) => m.slug === 'teachers')?.count ?? 0;
  const noticeCount = moduleCounts.find((m) => m.slug === 'notices')?.count ?? 0;
  const eventCount = moduleCounts.find((m) => m.slug === 'events')?.count ?? 0;
  const newsCount = moduleCounts.find((m) => m.slug === 'news')?.count ?? 0;

  const publishedPages = pagesQuery.data?.filter((p) => p.isPublished).length ?? 0;
  const totalPages = pagesQuery.data?.length ?? 0;
  const mediaCount = mediaQuery.data?.length ?? 0;

  // Content items created per month, last 6 months, across every module.
  const activityData = useMemo(() => {
    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString(undefined, { month: 'short' }) });
    }
    const counts: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
    for (const q of contentQueries) {
      for (const item of q.data ?? []) {
        const d = new Date(item.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key in counts) counts[key] += 1;
      }
    }
    return months.map((m) => ({ month: m.label, items: counts[m.key] }));
  }, [contentQueries]);

  const moduleBreakdown = useMemo(
    () => moduleCounts.filter((m) => m.count > 0).map((m) => ({ name: m.title, value: m.count })),
    [moduleCounts],
  );

  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold text-secondary mb-1">Dashboard</h1>
      {schoolQuery.data && <p className="text-sm text-gray-500 mb-6">{schoolQuery.data.name}</p>}

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {isError && <p className="text-sm text-red-600">Could not load your dashboard.</p>}

      {!isLoading && !isError && (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">School</p>
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 max-w-md flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-secondary">{schoolQuery.data?.name}</p>
                <p className="text-sm text-gray-500">{schoolQuery.data?.slug}.yoursaas.com</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  schoolQuery.data?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {schoolQuery.data?.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Teachers" value={teacherCount} />
            <StatCard label="Notices" value={noticeCount} />
            <StatCard label="Events" value={eventCount} />
            <StatCard label="News" value={newsCount} />
            <StatCard label="Pages" value={totalPages} />
            <StatCard label="Published pages" value={publishedPages} accent="text-green-600" />
            <StatCard label="Media files" value={mediaCount} />
            <StatCard
              label="Total content items"
              value={moduleCounts.reduce((sum, m) => sum + m.count, 0)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard title="Content added, last 6 months">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="items" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Content by module">
              {moduleBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400 py-16 text-center">No content yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={moduleBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {moduleBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <ChartCard title="Items per module">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={moduleCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="title" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {moduleCounts.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
