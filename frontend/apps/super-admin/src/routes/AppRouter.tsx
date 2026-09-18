import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RootRoute from './RootRoute';
import AdminLayout from '../layouts/AdminLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import SchoolsPage from '../pages/SchoolsPage';
import PlansPage from '../pages/PlansPage';
import AuditLogPage from '../pages/AuditLogPage';

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
    </Routes>
  );
}
