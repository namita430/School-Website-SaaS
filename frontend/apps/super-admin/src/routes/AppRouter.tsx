import { Route, Routes } from 'react-router-dom';
import RootRoute from './RootRoute';
import ProtectedRoute from './ProtectedRoute';
import SchoolProtectedRoute from './SchoolProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import SchoolsPage from '../pages/SchoolsPage';
import PlansPage from '../pages/PlansPage';
import AuditLogPage from '../pages/AuditLogPage';

import SchoolRootLayout from '../schooladmin/routes/RootLayout';
import SchoolHomeRoute from '../schooladmin/routes/HomeRoute';
import PageListPage from '../schooladmin/pages/PageListPage';
import BuilderPage from '../schooladmin/pages/BuilderPage';
import TemplatesPage from '../schooladmin/pages/TemplatesPage';
import TemplateEditorPage from '../schooladmin/pages/TemplateEditorPage';
import TemplateLivePreviewPage from '../schooladmin/pages/TemplateLivePreviewPage';
import NavigationPage from '../schooladmin/pages/NavigationPage';
import ThemePage from '../schooladmin/pages/ThemePage';
import ContentPage from '../schooladmin/pages/ContentPage';
import MediaLibraryPage from '../schooladmin/pages/MediaLibraryPage';
import SeoPage from '../schooladmin/pages/SeoPage';
import DomainPage from '../schooladmin/pages/DomainPage';
import BillingPage from '../schooladmin/pages/BillingPage';
import SchoolAuditLogPage from '../schooladmin/pages/AuditLogPage';
import PlaceholderPage from '../schooladmin/pages/PlaceholderPage';
import SettingsPage from '../schooladmin/pages/SettingsPage';

/**
 * Single merged app (see school-saas-project-status memory for the "why"):
 * "/" redirects to the login (or an active session's dashboard); "/login" is one login for every account
 * type; "/dashboard","/schools","/plans","/audit-log" are Super Admin
 * (gated by ProtectedRoute, requires isSuperAdmin); everything under
 * "/schooladmin" is the full School Admin app, ported in from the former
 * separate school-admin project (gated by SchoolProtectedRoute, requires an
 * active school membership) - its internal route tree and role-based
 * layout branching (Owner/Teacher/Student/Parent) are unchanged, just
 * prefixed.
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
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
  );
}
