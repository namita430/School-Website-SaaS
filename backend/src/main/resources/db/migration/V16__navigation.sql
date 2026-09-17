-- Phase 14+: site navigation. Previously "Navigation" was just a sidebar
-- placeholder in School Admin with no backing feature - the public site had
-- no persistent header/nav at all, so visitors landing on the home page had
-- no way to reach any other page. This table lets a school explicitly order
-- a set of {label, url} links; if a school hasn't configured any yet, the
-- public API falls back to listing published pages automatically (see
-- PublicSiteService.getNavigation()).

CREATE TABLE nav_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id       BIGINT NOT NULL,
    label           VARCHAR(100) NOT NULL,
    url             VARCHAR(500) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_nav_items_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_nav_items_school_id ON nav_items(school_id);

INSERT INTO permissions (code, description) VALUES
    ('NAVIGATION_MANAGE', 'Create, edit, and delete site navigation links');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('SUPER_ADMIN', 'SCHOOL_OWNER', 'SCHOOL_ADMIN', 'CONTENT_MANAGER')
  AND p.code = 'NAVIGATION_MANAGE';
