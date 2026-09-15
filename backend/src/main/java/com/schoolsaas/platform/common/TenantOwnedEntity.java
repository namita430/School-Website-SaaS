package com.schoolsaas.platform.common;

import com.schoolsaas.platform.tenant.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

/**
 * Base for every entity owned by a single school (tenant).
 *
 * Every subclass carries a mandatory {@code school_id} column and is
 * registered under the {@code tenantFilter} Hibernate filter, which is
 * enabled per-session from {@code TenantContext} (see the JPA config added
 * once the persistence layer is wired up in Phase 1). This is the
 * enforcement point referenced in the multi-tenancy strategy: application
 * code should never need to remember to add a school_id predicate manually,
 * and code review / ArchUnit tests should fail any repository method that
 * queries a TenantOwnedEntity subtype while the filter is disabled.
 *
 * Do not query tenant-owned entities outside of a request where
 * TenantContext has been set, except from explicitly super-admin-scoped
 * services that deliberately disable the filter.
 *
 * The tenantFilter only ever affects READS. It does nothing for INSERTs -
 * confirmed the hard way by actually running this against a live database:
 * creating a Page failed with "Column 'school_id' cannot be null" because
 * nothing set it. {@link #assignTenantIfMissing()} closes that gap by
 * auto-populating school_id from TenantContext just before insert, so
 * individual services don't each need to remember to call setSchoolId(...)
 * - the same "enforced at the entity level, not by convention" principle
 * as the read-side filter.
 */
@Getter
@Setter
@MappedSuperclass
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "schoolId", type = Long.class))
@Filter(name = "tenantFilter", condition = "school_id = :schoolId")
public abstract class TenantOwnedEntity extends BaseEntity {

    @Column(name = "school_id", nullable = false, updatable = false)
    private Long schoolId;

    @PrePersist
    private void assignTenantIfMissing() {
        if (schoolId == null) {
            schoolId = TenantContext.getCurrentSchoolId();
        }
    }
}
