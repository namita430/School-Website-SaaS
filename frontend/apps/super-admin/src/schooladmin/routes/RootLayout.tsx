import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import StudentLayout from '../layouts/StudentLayout';
import ParentLayout from '../layouts/ParentLayout';
import { useAuthStore } from '../../store/authStore';

/**
 * Picks the layout (and therefore the nav) by the caller's role for their
 * active school - TEACHER/STUDENT/PARENT get their restricted portals,
 * everyone else gets the full admin shell. The route tree underneath is
 * otherwise shared (see AppRouter): a student/parent navigating directly to
 * an admin-only URL still hits the same route, just without their layout's
 * nav pointing to it, and the backend's permission checks are the actual
 * enforcement boundary - this is a UI convenience, not the security boundary.
 */
export default function RootLayout() {
  const roleCode = useAuthStore((s) => s.activeRoleCode);
  if (roleCode === 'TEACHER') return <TeacherLayout />;
  if (roleCode === 'STUDENT') return <StudentLayout />;
  if (roleCode === 'PARENT') return <ParentLayout />;
  return <AdminLayout />;
}
