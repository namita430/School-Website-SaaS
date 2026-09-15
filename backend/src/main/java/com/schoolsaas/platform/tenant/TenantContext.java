package com.schoolsaas.platform.tenant;

/**
 * Holds the current request's tenant (school) id in a ThreadLocal.
 *
 * Populated per-request by {@link TenantResolutionFilter} (or by JWT claim
 * extraction in the security filter chain, once auth is implemented) and
 * MUST be cleared at the end of every request to avoid leaking a tenant id
 * into a thread reused by the servlet container's thread pool.
 *
 * Every tenant-owned repository/query must scope by the id held here.
 * A null value means "no tenant" — valid only for super-admin-scoped
 * requests, never for school-admin or public-site requests.
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_SCHOOL_ID = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setCurrentSchoolId(Long schoolId) {
        CURRENT_SCHOOL_ID.set(schoolId);
    }

    public static Long getCurrentSchoolId() {
        return CURRENT_SCHOOL_ID.get();
    }

    public static boolean hasTenant() {
        return CURRENT_SCHOOL_ID.get() != null;
    }

    public static void clear() {
        CURRENT_SCHOOL_ID.remove();
    }
}
