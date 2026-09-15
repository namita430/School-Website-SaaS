package com.schoolsaas.school.page;

import com.schoolsaas.platform.common.TenantOwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

/**
 * A school's page: identity and metadata only (slug, title, home flag).
 * Content itself lives in {@link PageVersion} (DRAFT/PUBLISHED), separated
 * out in Phase 6 - a Page used to carry a single content_json column
 * directly (Phase 4), which was draft-only with no publish step.
 */
@Getter
@Setter
@Entity
@Table(name = "pages", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "slug"}))
public class Page extends TenantOwnedEntity {

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(name = "is_home", nullable = false)
    private boolean isHome = false;

    /** SEO overrides - null means "fall back to the school's SeoSettings default"; see PublicSiteService. */
    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(name = "og_image_url", length = 1000)
    private String ogImageUrl;
}
