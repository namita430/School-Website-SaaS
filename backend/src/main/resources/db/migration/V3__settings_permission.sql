-- Permission for editing a school's own basic settings (name, etc.), distinct
-- from WEBSITE_EDIT (page/theme content) and SCHOOL_MANAGE (super admin's
-- school lifecycle control - suspend/activate/create).
INSERT INTO permissions (code, description) VALUES
    ('SETTINGS_EDIT', 'Edit school basic settings (name, etc.)');

-- SUPER_ADMIN already holds every permission via V2's seed, but that INSERT
-- ran once at migration time and does not retroactively cover permissions
-- added afterward - grant explicitly here.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('SUPER_ADMIN', 'SCHOOL_OWNER', 'SCHOOL_ADMIN')
  AND p.code = 'SETTINGS_EDIT';
