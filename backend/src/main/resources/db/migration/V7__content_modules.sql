-- Phase 8: dynamic school content modules. Each table follows the same
-- tenant-owned shape as every other content table in this schema.

CREATE TABLE notices (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT NULL,
    notice_date     DATE NULL,
    pinned          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notices_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_notices_school_id ON notices(school_id);

CREATE TABLE events (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    event_date      DATE NULL,
    location        VARCHAR(255) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_events_school_id ON events(school_id);

CREATE TABLE news (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT NULL,
    published_date  DATE NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_news_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_news_school_id ON news(school_id);

CREATE TABLE teachers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    designation     VARCHAR(255) NULL,
    bio             TEXT NULL,
    photo_url       VARCHAR(1000) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_teachers_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_teachers_school_id ON teachers(school_id);

CREATE TABLE gallery_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    caption         VARCHAR(255) NULL,
    image_url       VARCHAR(1000) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gallery_items_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_gallery_items_school_id ON gallery_items(school_id);

CREATE TABLE testimonials (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    author_name     VARCHAR(255) NOT NULL,
    author_role     VARCHAR(255) NULL,
    quote           TEXT NOT NULL,
    photo_url       VARCHAR(1000) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_testimonials_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_testimonials_school_id ON testimonials(school_id);

CREATE TABLE facilities (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    image_url       VARCHAR(1000) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_facilities_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_facilities_school_id ON facilities(school_id);

CREATE TABLE downloads (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    file_url        VARCHAR(1000) NOT NULL,
    category        VARCHAR(150) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_downloads_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_downloads_school_id ON downloads(school_id);

-- Permissions: NOTICE_CREATE/EDIT and EVENT_CREATE/EDIT already exist (V1) -
-- reused here to also gate delete. The other 6 types are simpler (no
-- separate create/edit workflow difference in practice) so get one MANAGE
-- permission each, covering create/update/delete - a deliberate asymmetry
-- with notices/events, not an oversight.
INSERT INTO permissions (code, description) VALUES
    ('NEWS_MANAGE',        'Create, edit, and delete news posts'),
    ('TEACHER_MANAGE',     'Create, edit, and delete teacher profiles'),
    ('GALLERY_MANAGE',     'Create, edit, and delete gallery items'),
    ('TESTIMONIAL_MANAGE', 'Create, edit, and delete testimonials'),
    ('FACILITY_MANAGE',    'Create, edit, and delete facilities'),
    ('DOWNLOAD_MANAGE',    'Create, edit, and delete downloadable files');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('SUPER_ADMIN', 'SCHOOL_OWNER', 'SCHOOL_ADMIN', 'CONTENT_MANAGER')
  AND p.code IN ('NEWS_MANAGE', 'TEACHER_MANAGE', 'GALLERY_MANAGE', 'TESTIMONIAL_MANAGE', 'FACILITY_MANAGE', 'DOWNLOAD_MANAGE');

-- New builder component types so this content can be placed on pages,
-- matching the existing notice_board component's schema convention.
INSERT INTO components (type_key, name, schema_json) VALUES
    ('events', 'Events', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', false),
        'limit', JSON_OBJECT('type', 'number', 'required', false)
    ))),
    ('news', 'News', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', false),
        'limit', JSON_OBJECT('type', 'number', 'required', false)
    ))),
    ('teachers', 'Teachers', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', false),
        'limit', JSON_OBJECT('type', 'number', 'required', false)
    ))),
    ('gallery', 'Gallery', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', false),
        'limit', JSON_OBJECT('type', 'number', 'required', false)
    ))),
    ('testimonials', 'Testimonials', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', false),
        'limit', JSON_OBJECT('type', 'number', 'required', false)
    ))),
    ('facilities', 'Facilities', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', false),
        'limit', JSON_OBJECT('type', 'number', 'required', false)
    ))),
    ('downloads', 'Downloads', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', false),
        'limit', JSON_OBJECT('type', 'number', 'required', false)
    )));
