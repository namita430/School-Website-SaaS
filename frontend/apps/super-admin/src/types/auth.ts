export interface SchoolMembership {
  schoolId: number;
  schoolName: string | null;
  roleCode: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: number;
  email: string;
  fullName: string;
  activeSchoolId: number | null;
  memberships: SchoolMembership[];
  globalRoles: string[];
}
