import { create } from 'zustand';
import type { AuthResponse } from '../types/auth';

/**
 * Holds the access token + basic user/session info in memory only, for
 * BOTH sides of this single merged app - a platform operator (globalRoles
 * includes SUPER_ADMIN) and a school-scoped user (owner/admin/teacher/
 * student/parent, via memberships) share this one store. The refresh token
 * never touches JS - it lives solely in the httpOnly cookie the backend
 * sets. On a hard page reload this store resets and a silent /auth/refresh
 * call (see api/client.ts) re-establishes the session from that cookie.
 */
interface AuthState {
  accessToken: string | null;
  userId: number | null;
  email: string | null;
  fullName: string | null;
  activeSchoolId: number | null;
  /** The caller's role for activeSchoolId, e.g. "TEACHER"/"SCHOOL_OWNER" - drives which school-admin layout/nav is shown. Null if activeSchoolId is null. */
  activeRoleCode: string | null;
  globalRoles: string[];
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  email: null,
  fullName: null,
  activeSchoolId: null,
  activeRoleCode: null,
  globalRoles: [],
  isSuperAdmin: false,
  isAuthenticated: false,
  setSession: (auth) =>
    set({
      accessToken: auth.accessToken,
      userId: auth.userId,
      email: auth.email,
      fullName: auth.fullName,
      activeSchoolId: auth.activeSchoolId,
      activeRoleCode: auth.memberships.find((m) => m.schoolId === auth.activeSchoolId)?.roleCode ?? null,
      globalRoles: auth.globalRoles,
      isSuperAdmin: auth.globalRoles.includes('SUPER_ADMIN'),
      isAuthenticated: true,
    }),
  clearSession: () =>
    set({
      accessToken: null,
      userId: null,
      email: null,
      fullName: null,
      activeSchoolId: null,
      activeRoleCode: null,
      globalRoles: [],
      isSuperAdmin: false,
      isAuthenticated: false,
    }),
}));
