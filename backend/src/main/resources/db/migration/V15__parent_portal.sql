-- Parent Portal - same shape as V14's STUDENT: a new SCHOOL-scoped,
-- read-only role. WEBSITE_VIEW already covers the notices/events/downloads
-- list endpoints, so no new permissions are needed here either.
INSERT INTO roles (code, name, scope) VALUES
    ('PARENT', 'Parent', 'SCHOOL');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'PARENT'
  AND p.code = 'WEBSITE_VIEW';
