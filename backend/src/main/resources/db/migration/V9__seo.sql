-- Per-page SEO overrides. NULL means "use the site-wide default from
-- seo_settings" - see SeoSettingsService/PublicSiteService for how the
-- fallback is applied.
ALTER TABLE pages
    ADD COLUMN meta_description TEXT NULL AFTER title,
    ADD COLUMN og_image_url VARCHAR(1000) NULL AFTER meta_description;

-- Site-wide SEO defaults, one row per school (same shape/pattern as themes).
CREATE TABLE seo_settings (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id                   BIGINT        NOT NULL,
    default_meta_description   TEXT          NULL,
    default_og_image_url       VARCHAR(1000) NULL,
    favicon_url                 VARCHAR(1000) NULL,
    robots_indexable            BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_seo_settings_school_id UNIQUE (school_id),
    CONSTRAINT fk_seo_settings_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
