package com.schoolsaas.publicsite.rendering;

import com.fasterxml.jackson.databind.JsonNode;
import com.schoolsaas.school.page.PageService;
import com.schoolsaas.school.seo.SeoSettings;

public record PublicPageResponse(String slug, String title, String metaDescription, String ogImageUrl, JsonNode contentJson) {

    /** Falls back to the school's site-wide SEO defaults wherever the page itself has no override. */
    public static PublicPageResponse from(PageService.PublishedPageContent content, SeoSettings defaults) {
        String metaDescription = content.metaDescription() != null ? content.metaDescription() : defaults.getDefaultMetaDescription();
        String ogImageUrl = content.ogImageUrl() != null ? content.ogImageUrl() : defaults.getDefaultOgImageUrl();
        return new PublicPageResponse(content.slug(), content.title(), metaDescription, ogImageUrl, content.contentJson());
    }
}
