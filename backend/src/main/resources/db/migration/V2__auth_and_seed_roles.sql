-- Refresh tokens (server-side, revocable) and GLOBAL-scope role assignment
-- (e.g. SUPER_ADMIN, who has no row in school_users), plus baseline
-- permissions/roles seed data.

CREATE TABLE refresh_tokens (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMP NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE TABLE user_global_roles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    role_id         BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_global_roles UNIQUE (user_id, role_id),
    CONSTRAINT fk_user_global_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_global_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Baseline permission catalog (extended in later phases as new modules land).
INSERT INTO permissions (code, description) VALUES
    ('WEBSITE_VIEW',   'View website configuration'),
    ('WEBSITE_EDIT',   'Edit website configuration'),
    ('PAGE_CREATE',    'Create pages'),
    ('PAGE_EDIT',      'Edit pages'),
    ('PAGE_DELETE',    'Delete pages'),
    ('THEME_EDIT',     'Edit theme/design tokens'),
    ('MEDIA_UPLOAD',   'Upload media assets'),
    ('NOTICE_CREATE',  'Create notices'),
    ('NOTICE_EDIT',    'Edit notices'),
    ('EVENT_CREATE',   'Create events'),
    ('EVENT_EDIT',     'Edit events'),
    ('USER_MANAGE',    'Manage school users'),
    ('DOMAIN_MANAGE',  'Manage custom domains'),
    ('SCHOOL_MANAGE',  'Manage schools (super admin)'),
    ('PLATFORM_MANAGE','Manage platform-wide settings (super admin)');

-- Baseline roles.
INSERT INTO roles (code, name, scope) VALUES
    ('SUPER_ADMIN',      'Super Admin',       'GLOBAL'),
    ('SCHOOL_OWNER',      'School Owner',       'SCHOOL'),
    ('SCHOOL_ADMIN',      'School Admin',       'SCHOOL'),
    ('EDITOR',            'Editor',             'SCHOOL'),
    ('CONTENT_MANAGER',   'Content Manager',    'SCHOOL'),
    ('TEACHER',           'Teacher',            'SCHOOL');

-- SUPER_ADMIN: every permission.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code = 'SUPER_ADMIN';

-- SCHOOL_OWNER / SCHOOL_ADMIN: every school-scoped permission (everything except PLATFORM_MANAGE/SCHOOL_MANAGE).
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('SCHOOL_OWNER', 'SCHOOL_ADMIN')
  AND p.code NOT IN ('PLATFORM_MANAGE', 'SCHOOL_MANAGE');

-- EDITOR: website/page/theme/media editing, no user or domain management.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'EDITOR'
  AND p.code IN ('WEBSITE_VIEW', 'WEBSITE_EDIT', 'PAGE_CREATE', 'PAGE_EDIT', 'PAGE_DELETE', 'THEME_EDIT', 'MEDIA_UPLOAD');

-- CONTENT_MANAGER: content modules only.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'CONTENT_MANAGER'
  AND p.code IN ('WEBSITE_VIEW', 'NOTICE_CREATE', 'NOTICE_EDIT', 'EVENT_CREATE', 'EVENT_EDIT', 'MEDIA_UPLOAD');

-- TEACHER: read-only view.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'TEACHER'
  AND p.code IN ('WEBSITE_VIEW');
