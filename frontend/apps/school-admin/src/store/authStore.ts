import { create } from 'zustand';
import type { AuthResponse } from '../types/auth';

/**
 * Holds the access token + basic user/session info in memory only.
 * The refresh token never touches JS - it lives solely in the httpOnly
 * cookie the backend sets, per the security architecture. On a hard page
 * reload this store resets and a silent /auth/refresh call (see api/client.ts)
 * re-establishes the session from that cookie.
 */
interface AuthState {
  accessToken: string | null;
  userId: number | null;
  email: string | null;
  fullName: string | null;
  activeSchoolId: number | null;
  /** The caller's role for activeSchoolId, e.g. "TEACHER"/"SCHOOL_OWNER" - drives which layout/nav is shown (see AppRouter). Null if activeSchoolId is null. */
  activeRoleCode: string | null;
  globalRoles: string[];
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
      isAuthenticated: false,
    }),
}));
