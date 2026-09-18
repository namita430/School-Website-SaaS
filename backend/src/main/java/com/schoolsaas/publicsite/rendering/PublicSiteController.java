package com.schoolsaas.publicsite.rendering;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Unauthenticated public endpoints (permitAll under /api/v1/public/**, see
 * SecurityConfig) - what a school's visitors actually hit. Never exposes
 * anything but PUBLISHED content; draft content is only ever reachable
 * through the authenticated /api/v1/pages/** endpoints.
 *
 * sitemap.xml/robots.txt live under this same /api/v1/public/ prefix
 * (rather than at the site root) so TenantResolutionFilter's existing
 * "startsWith /api/v1/public/" check covers them without a special case.
 * Serving them at the conventional root paths (/sitemap.xml, /robots.txt)
 * in production requires a reverse-proxy rewrite rule pointing those paths
 * at these endpoints - that's Phase 11 infra work, not done here.
 */
@RestController
@RequestMapping("/api/v1/public")
public class PublicSiteController {

    private final PublicSiteService publicSiteService;

    public PublicSiteController(PublicSiteService publicSiteService) {
        this.publicSiteService = publicSiteService;
    }

    @GetMapping("/site")
    public PublicSiteResponse site() {
        return publicSiteService.getSiteInfo();
    }

    @GetMapping("/pages/home")
    public PublicPageResponse home() {
        return publicSiteService.getHomePage();
    }

    @GetMapping("/pages/{slug}")
    public PublicPageResponse bySlug(@PathVariable String slug) {
        return publicSiteService.getPageBySlug(slug);
    }

    @GetMapping("/navigation")
    public java.util.List<PublicSiteService.PublicNavItem> navigation() {
        return publicSiteService.getNavigation();
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                .body(publicSiteService.getSitemapXml());
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_PLAIN_VALUE)
                .body(publicSiteService.getRobotsTxt());
    }
}
