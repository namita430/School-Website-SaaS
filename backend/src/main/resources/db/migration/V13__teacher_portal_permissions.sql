-- Phase 14: Teacher Portal. The TEACHER role existed since Phase 1 but was
-- seeded read-only (WEBSITE_VIEW only) - a teacher had no reason to manage
-- content until there was a teacher-facing experience to do it from. Grants
-- notices/events management, matching the "view/manage the content they're
-- responsible for" scope agreed with the user - NOT full content-manager
-- access (no GALLERY_MANAGE, no PAGE_EDIT, etc.), a deliberately narrower
-- grant than CONTENT_MANAGER's.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'TEACHER'
  AND p.code IN ('NOTICE_CREATE', 'NOTICE_EDIT', 'EVENT_CREATE', 'EVENT_EDIT');
