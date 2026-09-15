-- Separates DRAFT from PUBLISHED page content (architecture principle #20):
-- the builder always reads/writes DRAFT; the public renderer only ever
-- reads PUBLISHED. Exactly one row per (page_id, status) - "the" draft and
-- "the" published version, upserted in place rather than accumulating
-- history rows (a fuller version history is a future refinement, not
-- required by this phase).
CREATE TABLE page_versions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_id         BIGINT        NOT NULL,
    status          VARCHAR(20)   NOT NULL, -- DRAFT | PUBLISHED
    content_json    JSON          NOT NULL,
    published_at    TIMESTAMP     NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_page_versions_page_status UNIQUE (page_id, status),
    CONSTRAINT fk_page_versions_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_page_versions_page_id ON page_versions(page_id);

-- Move every existing page's content_json (previously the page's only
-- representation, draft by implication) into its DRAFT version row.
INSERT INTO page_versions (page_id, status, content_json, created_at, updated_at)
SELECT id, 'DRAFT', content_json, created_at, updated_at FROM pages;

ALTER TABLE pages DROP COLUMN content_json;
