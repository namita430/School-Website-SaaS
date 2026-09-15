package com.schoolsaas.platform.security;

/**
 * The authenticated principal attached to the SecurityContext for the
 * lifetime of a request, built from the validated JWT's claims - no
 * database lookup needed per request.
 */
public record AppUserPrincipal(Long userId, String email, Long schoolId) {
}
