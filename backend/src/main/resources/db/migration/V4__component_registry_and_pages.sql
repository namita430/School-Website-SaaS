-- Global component registry: the catalog the website builder draws from.
-- Adding a new component type is a data change (INSERT here), never a code
-- change to the builder or the validator - see PageContentValidator.
CREATE TABLE components (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_key        VARCHAR(100)  NOT NULL,
    name            VARCHAR(150)  NOT NULL,
    schema_json     JSON          NOT NULL,
    is_global       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_components_type_key UNIQUE (type_key)
) ENGINE=InnoDB;

-- A school's pages. content_json is the ENTIRE structured representation of
-- the page (sections + component props) - see architecture principle #9:
-- never store generated HTML as the primary representation. This is a
-- single DRAFT column for now; separating DRAFT from PUBLISHED content via
-- a page_versions table is deliberately deferred to Phase 6, so nothing
-- written through here is publicly visible yet regardless.
CREATE TABLE pages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT        NOT NULL,
    slug            VARCHAR(150)  NOT NULL,
    title           VARCHAR(255)  NOT NULL,
    is_home         BOOLEAN       NOT NULL DEFAULT FALSE,
    content_json    JSON          NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_pages_school_slug UNIQUE (school_id, slug),
    CONSTRAINT fk_pages_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_pages_school_id ON pages(school_id);

-- Baseline component catalog. schema_json format is a small, hand-rolled
-- convention (not full JSON Schema, kept intentionally simple for Phase 4):
--   { "properties": { "<propName>": { "type": "string|number|boolean|array|object", "required": true|false } } }
-- See PageContentValidator for how this is enforced.
INSERT INTO components (type_key, name, schema_json) VALUES
    ('navbar', 'Navbar', JSON_OBJECT('properties', JSON_OBJECT(
        'logo', JSON_OBJECT('type', 'string', 'required', false),
        'links', JSON_OBJECT('type', 'array', 'required', false)
    ))),
    ('hero', 'Hero', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', true),
        'subtitle', JSON_OBJECT('type', 'string', 'required', false),
        'image', JSON_OBJECT('type', 'string', 'required', false)
    ))),
    ('heading', 'Heading', JSON_OBJECT('properties', JSON_OBJECT(
        'text', JSON_OBJECT('type', 'string', 'required', true),
        'level', JSON_OBJECT('type', 'number', 'required', false)
    ))),
    ('text', 'Text', JSON_OBJECT('properties', JSON_OBJECT(
        'content', JSON_OBJECT('type', 'string', 'required', true)
    ))),
    ('image', 'Image', JSON_OBJECT('properties', JSON_OBJECT(
        'src', JSON_OBJECT('type', 'string', 'required', true),
        'alt', JSON_OBJECT('type', 'string', 'required', false)
    ))),
    ('about', 'About', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', true),
        'body', JSON_OBJECT('type', 'string', 'required', false),
        'image', JSON_OBJECT('type', 'string', 'required', false)
    ))),
    ('cta', 'Call to Action', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', true),
        'buttonLabel', JSON_OBJECT('type', 'string', 'required', false),
        'buttonUrl', JSON_OBJECT('type', 'string', 'required', false)
    ))),
    ('notice_board', 'Notice Board', JSON_OBJECT('properties', JSON_OBJECT(
        'title', JSON_OBJECT('type', 'string', 'required', false),
        'limit', JSON_OBJECT('type', 'number', 'required', false)
    ))),
    ('footer', 'Footer', JSON_OBJECT('properties', JSON_OBJECT(
        'text', JSON_OBJECT('type', 'string', 'required', false),
        'socialLinks', JSON_OBJECT('type', 'array', 'required', false)
    )));
