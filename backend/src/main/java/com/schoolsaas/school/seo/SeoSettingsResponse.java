package com.schoolsaas.school.seo;

public record SeoSettingsResponse(String defaultMetaDescription, String defaultOgImageUrl, String faviconUrl, boolean robotsIndexable) {
    static SeoSettingsResponse from(SeoSettings s) {
        return new SeoSettingsResponse(s.getDefaultMetaDescription(), s.getDefaultOgImageUrl(), s.getFaviconUrl(), s.isRobotsIndexable());
    }
}
