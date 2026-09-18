package com.schoolsaas.platform.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * CORS was missing entirely until a real browser login attempt surfaced it
 * (curl doesn't enforce CORS, so backend-only testing never caught this) -
 * every frontend origin allowed to call this API must be listed here.
 * Origin PATTERNS (not exact origins) are used so a single entry can cover
 * every subdomain of localhost (abcschool.localhost, demo.localhost, ...)
 * for the public-site app's local dev testing convention - see
 * TenantResolutionFilter.
 */
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    private List<String> allowedOriginPatterns = List.of(
            // The single merged app (landing + Super Admin + School Admin).
            "http://localhost:5173",
            // The public-site app - every school's own subdomain, plus the
            // bare host for the platform's own landing page there.
            "http://*.localhost:5175",
            "http://localhost:5175"
    );

    public List<String> getAllowedOriginPatterns() {
        return allowedOriginPatterns;
    }

    public void setAllowedOriginPatterns(List<String> allowedOriginPatterns) {
        this.allowedOriginPatterns = allowedOriginPatterns;
    }
}
