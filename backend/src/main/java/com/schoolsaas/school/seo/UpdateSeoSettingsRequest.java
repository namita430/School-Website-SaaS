package com.schoolsaas.school.seo;

public record UpdateSeoSettingsRequest(String defaultMetaDescription, String defaultOgImageUrl, String faviconUrl, boolean robotsIndexable) {
}
