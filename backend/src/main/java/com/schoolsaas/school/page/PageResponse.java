package com.schoolsaas.school.page;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;

public record PageResponse(
        Long id,
        String slug,
        String title,
        boolean isHome,
        String metaDescription,
        String ogImageUrl,
        JsonNode draftContentJson,
        boolean isPublished,
        Instant publishedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static PageResponse from(Page page, PageVersion draft, PageVersion published) {
        return new PageResponse(
                page.getId(),
                page.getSlug(),
                page.getTitle(),
                page.isHome(),
                page.getMetaDescription(),
                page.getOgImageUrl(),
                draft != null ? draft.getContentJson() : null,
                published != null,
                published != null ? published.getPublishedAt() : null,
                page.getCreatedAt(),
                page.getUpdatedAt()
        );
    }
}
