package com.schoolsaas.platform.tenant;

import com.schoolsaas.school.domain.Domain;
import com.schoolsaas.school.domain.DomainRepository;
import com.schoolsaas.school.domain.VerificationStatus;
import com.schoolsaas.superadmin.school.School;
import com.schoolsaas.superadmin.school.SchoolRepository;
import com.schoolsaas.superadmin.school.SchoolStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Locale;
import java.util.Optional;

/**
 * Resolves the request's tenant (school) and populates {@link TenantContext}.
 *
 * Two resolution paths, per architecture:
 *   1. Public site requests: resolved from the Host header - either a
 *      subdomain of the platform's base domain ({@code abcschool.yoursaas.com})
 *      or a verified custom domain ({@code abcschool.com}) looked up in the
 *      `domains` table (Phase 11 - subdomain resolution alone shipped in
 *      Phase 6). Subdomain is tried first since it's the cheaper check (no
 *      DB query); custom domain is the fallback. Only public
 *      (/api/v1/public/**) requests are resolved this way; everything else
 *      ignores whatever this filter found.
 *   2. Admin API requests (super-admin / school-admin apps): resolved from
 *      the authenticated JWT's `schoolId` claim, set in JwtAuthenticationFilter
 *      further down the Spring Security filter chain - NOT here, since this
 *      filter runs before authentication.
 *
 * Host resolution prefers X-Forwarded-Host over the request's own Host
 * header, matching a standard reverse-proxy setup (see architecture
 * deployment notes) where a proxy terminates the tenant's real domain and
 * forwards to this shared backend - the proxy is expected to set that
 * header to the domain the visitor actually requested. In local dev without
 * a proxy in front, the public-site frontend sets this header itself (see
 * its api/client.ts) so a single backend can still serve multiple "hosts".
 */
@Component
@Order(1)
public class TenantResolutionFilter extends OncePerRequestFilter {

    private final SchoolRepository schoolRepository;
    private final DomainRepository domainRepository;
    private final PublicSiteProperties publicSiteProperties;

    public TenantResolutionFilter(SchoolRepository schoolRepository, DomainRepository domainRepository, PublicSiteProperties publicSiteProperties) {
        this.schoolRepository = schoolRepository;
        this.domainRepository = domainRepository;
        this.publicSiteProperties = publicSiteProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        try {
            if (request.getRequestURI().startsWith("/api/v1/public/")) {
                resolveHostToTenant(request).ifPresent(school -> TenantContext.setCurrentSchoolId(school.getId()));
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private Optional<School> resolveHostToTenant(HttpServletRequest request) {
        String host = firstNonBlank(request.getHeader("X-Forwarded-Host"), request.getHeader("Host"));
        if (host == null) {
            return Optional.empty();
        }
        // Strip port (e.g. "abcschool.localhost:8080") and normalize case.
        String hostname = host.split(":")[0].toLowerCase(Locale.ROOT);

        Optional<School> bySubdomain = resolveBySubdomain(hostname);
        return bySubdomain.isPresent() ? bySubdomain : resolveByCustomDomain(hostname);
    }

    private Optional<School> resolveBySubdomain(String hostname) {
        String baseDomain = publicSiteProperties.getBaseDomain();
        if (baseDomain == null || !hostname.endsWith("." + baseDomain)) {
            return Optional.empty();
        }
        String slug = hostname.substring(0, hostname.length() - baseDomain.length() - 1);
        if (slug.isBlank() || slug.contains(".")) {
            // Root domain itself, or a nested subdomain we don't support yet.
            return Optional.empty();
        }

        return schoolRepository.findBySlug(slug)
                .filter(school -> school.getStatus() == SchoolStatus.ACTIVE);
    }

    /**
     * Looked up with no TenantContext set yet - deliberately so, this query
     * is what DETERMINES the tenant, so the Hibernate tenantFilter (which
     * only activates once TenantContext already holds a school id) is
     * naturally left disabled here and searches across every school's
     * domains, exactly as needed.
     */
    private Optional<School> resolveByCustomDomain(String hostname) {
        Optional<Domain> domain = domainRepository.findByDomainIgnoreCaseAndVerificationStatus(hostname, VerificationStatus.VERIFIED);
        if (domain.isEmpty()) {
            return Optional.empty();
        }
        return schoolRepository.findById(domain.get().getSchoolId())
                .filter(school -> school.getStatus() == SchoolStatus.ACTIVE);
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }
}
