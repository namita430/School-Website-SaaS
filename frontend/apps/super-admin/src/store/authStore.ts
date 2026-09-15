import { create } from 'zustand';
import type { AuthResponse } from '../types/auth';

/**
 * This app is exclusively for platform operators - isAuthenticated alone
 * isn't enough to grant access (see ProtectedRoute), the caller must also
 * carry the SUPER_ADMIN global role. Access token kept in memory only, same
 * as school-admin - the refresh token lives solely in the httpOnly cookie.
 */
interface AuthState {
  accessToken: string | null;
  fullName: string | null;
  email: string | null;
  globalRoles: string[];
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  fullName: null,
  email: null,
  globalRoles: [],
  isAuthenticated: false,
  isSuperAdmin: false,
  setSession: (auth) =>
    set({
      accessToken: auth.accessToken,
      fullName: auth.fullName,
      email: auth.email,
      globalRoles: auth.globalRoles,
      isAuthenticated: true,
      isSuperAdmin: auth.globalRoles.includes('SUPER_ADMIN'),
    }),
  clearSession: () =>
    set({
      accessToken: null,
      fullName: null,
      email: null,
      globalRoles: [],
      isAuthenticated: false,
      isSuperAdmin: false,
    }),
}));
