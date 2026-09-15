package com.schoolsaas.publicsite.rendering;

import com.fasterxml.jackson.databind.JsonNode;

public record PublicSiteResponse(
        String schoolName,
        String schoolSlug,
        String homePageSlug,
        JsonNode themeTokens,
        String faviconUrl,
        boolean robotsIndexable
) {
}
