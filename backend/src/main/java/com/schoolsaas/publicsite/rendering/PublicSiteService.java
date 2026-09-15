package com.schoolsaas.publicsite.rendering;

import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.platform.tenant.PublicSiteProperties;
import com.schoolsaas.platform.tenant.TenantContext;
import com.schoolsaas.school.page.PageService;
import com.schoolsaas.school.seo.SeoSettings;
import com.schoolsaas.school.seo.SeoSettingsService;
import com.schoolsaas.school.theme.ThemeService;
import com.schoolsaas.superadmin.school.School;
import com.schoolsaas.superadmin.school.SchoolService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

/**
 * Read-only, unauthenticated (permitAll, see SecurityConfig) - this is what
 * a school's public visitors actually hit. Reuses PageService, SchoolService,
 * ThemeService and SeoSettingsService (cross-module service reuse,
 * consistent with SchoolSelfController) rather than touching their
 * repositories directly.
 *
 * Every method here requires TenantContext to already be set - by
 * TenantResolutionFilter, from the request's Host header - and throws
 * NotFoundException (-> 404, via GlobalExceptionHandler) when it isn't,
 * which is the correct response for "this hostname isn't a school we know
 * about" (never leak whether a slug exists for an unmatched domain).
 *
 * NONE of the methods here are readOnly, deliberately: every one of them
 * eventually calls a getOrCreateForCurrentSchool()-style helper (Theme
 * and/or SeoSettings), which can INSERT a default row on first access -
 * see SeoSettingsService's Javadoc for why nesting a write inside a
 * readOnly=true transaction breaks against MySQL. This class has already
 * been bitten by this twice (Phase 6, Phase 7); every method here is kept
 * plain @Transactional on purpose rather than re-litigating it per method.
 */
@Service
public class PublicSiteService {

    private final SchoolService schoolService;
    private final PageService pageService;
    private final ThemeService themeService;
    private final SeoSettingsService seoSettingsService;
    private final PublicSiteProperties publicSiteProperties;

    public PublicSiteService(SchoolService schoolService, PageService pageService, ThemeService themeService,
                              SeoSettingsService seoSettingsService, PublicSiteProperties publicSiteProperties) {
        this.schoolService = schoolService;
        this.pageService = pageService;
        this.themeService = themeService;
        this.seoSettingsService = seoSettingsService;
        this.publicSiteProperties = publicSiteProperties;
    }

    @Transactional
    public PublicSiteResponse getSiteInfo() {
        School school = currentSchoolOrThrow();
        String homeSlug = pageService.getPublishedHomePage().map(PageService.PublishedPageContent::slug).orElse(null);
        var theme = themeService.getOrCreateForCurrentSchool();
        SeoSettings seo = seoSettingsService.getOrCreateForCurrentSchool();
        return new PublicSiteResponse(school.getName(), school.getSlug(), homeSlug, theme.getTokensJson(), seo.getFaviconUrl(), seo.isRobotsIndexable());
    }

    @Transactional
    public PublicPageResponse getHomePage() {
        currentSchoolOrThrow();
        SeoSettings seo = seoSettingsService.getOrCreateForCurrentSchool();
        return pageService.getPublishedHomePage()
                .map(content -> PublicPageResponse.from(content, seo))
                .orElseThrow(() -> new NotFoundException("This site has no published home page"));
    }

    @Transactional
    public PublicPageResponse getPageBySlug(String slug) {
        currentSchoolOrThrow();
        SeoSettings seo = seoSettingsService.getOrCreateForCurrentSchool();
        return pageService.getPublishedBySlug(slug)
                .map(content -> PublicPageResponse.from(content, seo))
                .orElseThrow(() -> new NotFoundException("Page '" + slug + "' not found"));
    }

    /** application/xml sitemap listing every published page, per architecture principle #22. */
    @Transactional(readOnly = true)
    public String getSitemapXml() {
        School school = currentSchoolOrThrow();
        String origin = "https://" + school.getSlug() + "." + publicSiteProperties.getBaseDomain();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (PageService.PublishedPageContent page : pageService.listPublished()) {
            xml.append("  <url>\n");
            xml.append("    <loc>").append(origin).append('/').append(escapeXml(page.slug())).append("</loc>\n");
            if (page.publishedAt() != null) {
                xml.append("    <lastmod>").append(DateTimeFormatter.ISO_INSTANT.format(page.publishedAt())).append("</lastmod>\n");
            }
            xml.append("  </url>\n");
        }
        xml.append("</urlset>\n");
        return xml.toString();
    }

    /** text/plain robots.txt - Disallow-all when the school has turned off indexing in SeoSettings. */
    @Transactional
    public String getRobotsTxt() {
        School school = currentSchoolOrThrow();
        SeoSettings seo = seoSettingsService.getOrCreateForCurrentSchool();
        String origin = "https://" + school.getSlug() + "." + publicSiteProperties.getBaseDomain();

        StringBuilder txt = new StringBuilder("User-agent: *\n");
        txt.append(seo.isRobotsIndexable() ? "Allow: /\n" : "Disallow: /\n");
        txt.append("Sitemap: ").append(origin).append("/api/v1/public/sitemap.xml\n");
        return txt.toString();
    }

    private School currentSchoolOrThrow() {
        Long schoolId = TenantContext.getCurrentSchoolId();
        if (schoolId == null) {
            throw new NotFoundException("Site not found");
        }
        return schoolService.getById(schoolId);
    }

    private static String escapeXml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
