-- Media library metadata. The file itself is never stored in this table
-- (per architecture principle #21 - large media does not belong in MySQL);
-- only its storage key/URL and a few descriptive fields are. See
-- StorageService for the pluggable storage backend this points at.
CREATE TABLE media_assets (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT        NOT NULL,
    file_name       VARCHAR(255)  NOT NULL,
    storage_key     VARCHAR(500)  NOT NULL,
    url             VARCHAR(1000) NOT NULL,
    content_type    VARCHAR(150)  NOT NULL,
    size_bytes      BIGINT        NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_assets_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_media_assets_school_id ON media_assets(school_id);
