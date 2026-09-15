package com.schoolsaas.school.seo;

import com.schoolsaas.platform.common.TenantOwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Site-wide SEO defaults - exactly one row per school, same shape as Theme.
 * Per-page values (Page.metaDescription/ogImageUrl) override these when
 * present; see PageService/PublicSiteService for the fallback logic.
 */
@Getter
@Setter
@Entity
@Table(name = "seo_settings")
public class SeoSettings extends TenantOwnedEntity {

    @Column(name = "default_meta_description", columnDefinition = "TEXT")
    private String defaultMetaDescription;

    @Column(name = "default_og_image_url", length = 1000)
    private String defaultOgImageUrl;

    @Column(name = "favicon_url", length = 1000)
    private String faviconUrl;

    @Column(name = "robots_indexable", nullable = false)
    private boolean robotsIndexable = true;
}
