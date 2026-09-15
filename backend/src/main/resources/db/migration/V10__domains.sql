-- Custom domains a school wants to point at their site (e.g. abcschool.com).
-- The default subdomain (abcschool.yoursaas.com) needs no row here - it's
-- resolved directly from schools.slug (see TenantResolutionFilter); this
-- table is CUSTOM-domain-only in this implementation, despite the `type`
-- column existing for schema fidelity with the architecture doc's example.
--
-- `domain` is UNIQUE across the WHOLE platform, not per-school - two
-- schools must never be able to claim the same custom domain. This is
-- enforced at the database level (here) AND at the application level
-- (DomainService explicitly bypasses the per-tenant Hibernate filter for
-- that one uniqueness check, since normal tenant-scoped queries would only
-- ever see the current school's own domains).
CREATE TABLE domains (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id               BIGINT        NOT NULL,
    domain                  VARCHAR(255)  NOT NULL,
    type                    VARCHAR(20)   NOT NULL DEFAULT 'CUSTOM',
    verification_token      VARCHAR(100)  NOT NULL,
    verification_status     VARCHAR(20)   NOT NULL DEFAULT 'PENDING', -- PENDING | VERIFIED | FAILED
    ssl_status               VARCHAR(20)   NOT NULL DEFAULT 'NONE',    -- NONE | PROVISIONING | ACTIVE
    is_primary               BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_domains_domain UNIQUE (domain),
    CONSTRAINT fk_domains_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_domains_school_id ON domains(school_id);
