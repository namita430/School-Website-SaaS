import DashboardPage from '../pages/DashboardPage';
import TeacherDashboardPage from '../pages/TeacherDashboardPage';
import StudentDashboardPage from '../pages/StudentDashboardPage';
import { useAuthStore } from '../store/authStore';

export default function HomeRoute() {
  const roleCode = useAuthStore((s) => s.activeRoleCode);
  if (roleCode === 'TEACHER') return <TeacherDashboardPage />;
  // PARENT reuses StudentDashboardPage's content directly - both roles are
  // read-only over the same notices/events/downloads today, and diverge
  // only in ParentLayout/StudentLayout's header wording. If a parent's
  // dashboard later needs different content (e.g. their children's data),
  // give it its own component instead of branching inside this one.
  if (roleCode === 'STUDENT' || roleCode === 'PARENT') return <StudentDashboardPage />;
  return <DashboardPage />;
}
