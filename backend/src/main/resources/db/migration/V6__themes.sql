-- One theme (design token set) per school. Tokens are stored as a flat JSON
-- object of named values (colorPrimary, fontHeading, etc. - see
-- ThemeService.defaultTokens()) rather than fixed columns, so new tokens can
-- be introduced later without a migration - the same reasoning as
-- components.schema_json and pages.content_json in earlier phases.
CREATE TABLE themes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT        NOT NULL,
    tokens_json     JSON          NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_themes_school_id UNIQUE (school_id),
    CONSTRAINT fk_themes_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
