package com.schoolsaas.user;

public enum RoleScope {
    /** Applies platform-wide, independent of any school (e.g. SUPER_ADMIN). */
    GLOBAL,
    /** Applies only within the school the assignment (SchoolUser row) belongs to. */
    SCHOOL
}
