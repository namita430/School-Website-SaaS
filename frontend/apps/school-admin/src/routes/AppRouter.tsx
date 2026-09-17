import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RootLayout from './RootLayout';
import HomeRoute from './HomeRoute';
import LoginPage from '../pages/LoginPage';
import SettingsPage from '../pages/SettingsPage';
import PageListPage from '../pages/PageListPage';
import BuilderPage from '../pages/BuilderPage';
import ThemePage from '../pages/ThemePage';
import ContentPage from '../pages/ContentPage';
import NavigationPage from '../pages/NavigationPage';
import MediaLibraryPage from '../pages/MediaLibraryPage';
import SeoPage from '../pages/SeoPage';
import DomainPage from '../pages/DomainPage';
import BillingPage from '../pages/BillingPage';
import AuditLogPage from '../pages/AuditLogPage';
import PlaceholderPage from '../pages/PlaceholderPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/website/pages" element={<PageListPage />} />
          <Route path="/website/builder/:pageId" element={<BuilderPage />} />
          <Route path="/website/navigation" element={<NavigationPage />} />
          <Route path="/website/theme" element={<ThemePage />} />
          <Route path="/content/:moduleSlug" element={<ContentPage />} />
          <Route path="/media" element={<MediaLibraryPage />} />
          <Route path="/seo" element={<SeoPage />} />
          <Route path="/domain" element={<DomainPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
          <Route path="/users" element={<PlaceholderPage title="Users & Roles" />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
