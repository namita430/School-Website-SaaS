-- Student Portal: a new SCHOOL-scoped role that didn't exist before
-- (unlike TEACHER, which was seeded since Phase 1). Read-only by design -
-- WEBSITE_VIEW is the only permission granted, which already covers the
-- notices/events/downloads list endpoints (see school.content's controllers,
-- all of which gate GET with PERM_WEBSITE_VIEW) - no new permissions needed.
INSERT INTO roles (code, name, scope) VALUES
    ('STUDENT', 'Student', 'SCHOOL');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'STUDENT'
  AND p.code = 'WEBSITE_VIEW';
