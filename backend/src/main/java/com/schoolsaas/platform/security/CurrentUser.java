package com.schoolsaas.platform.security;

import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Small helper to read the authenticated user's id off the SecurityContext
 * (populated by JwtAuthenticationFilter) - extracted here so callers like
 * AuditLogService don't each duplicate the null-checking/casting.
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    /** Null when there is no authenticated principal (e.g. a request that reached a permitAll endpoint unauthenticated). */
    public static Long userIdOrNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AppUserPrincipal principal)) {
            return null;
        }
        return principal.userId();
    }
}
