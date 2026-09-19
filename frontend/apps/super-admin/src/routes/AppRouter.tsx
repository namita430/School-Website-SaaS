import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import RootRoute from './RootRoute';
import ProtectedRoute from './ProtectedRoute';
import SchoolProtectedRoute from './SchoolProtectedRoute';
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
import LoginPage from '../pages/LoginPage';
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const SchoolsPage = lazy(() => import('../pages/SchoolsPage'));
const PlansPage = lazy(() => import('../pages/PlansPage'));
const AuditLogPage = lazy(() => import('../pages/AuditLogPage'));

const SchoolRootLayout = lazy(() => import('../schooladmin/routes/RootLayout'));
const SchoolHomeRoute = lazy(() => import('../schooladmin/routes/HomeRoute'));
const PageListPage = lazy(() => import('../schooladmin/pages/PageListPage'));
const BuilderPage = lazy(() => import('../schooladmin/pages/BuilderPage'));
const TemplatesPage = lazy(() => import('../schooladmin/pages/TemplatesPage'));
const TemplateEditorPage = lazy(() => import('../schooladmin/pages/TemplateEditorPage'));
const TemplateLivePreviewPage = lazy(() => import('../schooladmin/pages/TemplateLivePreviewPage'));
const NavigationPage = lazy(() => import('../schooladmin/pages/NavigationPage'));
const ThemePage = lazy(() => import('../schooladmin/pages/ThemePage'));
const ContentPage = lazy(() => import('../schooladmin/pages/ContentPage'));
const MediaLibraryPage = lazy(() => import('../schooladmin/pages/MediaLibraryPage'));
const SeoPage = lazy(() => import('../schooladmin/pages/SeoPage'));
const DomainPage = lazy(() => import('../schooladmin/pages/DomainPage'));
const BillingPage = lazy(() => import('../schooladmin/pages/BillingPage'));
const SchoolAuditLogPage = lazy(() => import('../schooladmin/pages/AuditLogPage'));
const PlaceholderPage = lazy(() => import('../schooladmin/pages/PlaceholderPage'));
const SettingsPage = lazy(() => import('../schooladmin/pages/SettingsPage'));

function RouteFallback() {
  return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading…</div>;
}

/**
 * Single merged app (see school-saas-project-status memory for the "why"):
 * "/" is the public landing page; "/login" is one login for every account
 * type; "/admin-login" (dashboard),"/schools","/plans","/audit-log" are Super Admin
 * (gated by ProtectedRoute, requires isSuperAdmin); everything under
 * "/schooladmin" is the full School Admin app, ported in from the former
 * separate school-admin project (gated by SchoolProtectedRoute, requires an
 * active school membership) - its internal route tree and role-based
 * layout branching (Owner/Teacher/Student/Parent) are unchanged, just
 * prefixed.
 */
export default function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin-login" element={<DashboardPage />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
        </Route>
      </Route>

      <Route element={<SchoolProtectedRoute />}>
        {/* A live template preview is deliberately outside SchoolRootLayout: it
            must look exactly like a visitor-facing school website, without
            admin UI. */}
        <Route path="/schooladmin/website/templates/:templateId/preview" element={<TemplateLivePreviewPage />} />
        <Route element={<SchoolRootLayout />}>
          <Route path="/schooladmin" element={<SchoolHomeRoute />} />
          <Route path="/schooladmin/website/pages" element={<PageListPage />} />
          <Route path="/schooladmin/website/templates" element={<TemplatesPage />} />
          <Route path="/schooladmin/website/templates/:templateId/edit" element={<TemplateEditorPage />} />
          <Route path="/schooladmin/website/builder/:pageId" element={<BuilderPage />} />
          <Route path="/schooladmin/website/navigation" element={<NavigationPage />} />
          <Route path="/schooladmin/website/theme" element={<ThemePage />} />
          <Route path="/schooladmin/content/:moduleSlug" element={<ContentPage />} />
          <Route path="/schooladmin/media" element={<MediaLibraryPage />} />
          <Route path="/schooladmin/seo" element={<SeoPage />} />
          <Route path="/schooladmin/domain" element={<DomainPage />} />
          <Route path="/schooladmin/billing" element={<BillingPage />} />
          <Route path="/schooladmin/audit-log" element={<SchoolAuditLogPage />} />
          <Route path="/schooladmin/users" element={<PlaceholderPage title="Users & Roles" />} />
          <Route path="/schooladmin/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  );
}
