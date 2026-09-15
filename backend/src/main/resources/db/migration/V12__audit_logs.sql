-- Audit trail for sensitive admin actions (architecture principle #37,
-- e.g. "Super Admin suspended School ABC", "School Admin published Home
-- Page"). Deliberately NOT a tenant-owned table in the usual sense -
-- school_id is nullable and carries no Hibernate tenantFilter, because a
-- super-admin action (e.g. suspending a school) is performed by an actor
-- who does NOT belong to that school's tenant; TenantContext may be null
-- when the write happens. Reads are filtered explicitly per query instead
-- (see AuditLogService): school-scoped queries add an explicit
-- "WHERE school_id = ?", the platform-wide superadmin view has none.
CREATE TABLE audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id   BIGINT       NULL,
    school_id       BIGINT       NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NULL,
    entity_id       VARCHAR(100) NULL,
    metadata_json    JSON         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_audit_logs_school_id ON audit_logs(school_id);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
