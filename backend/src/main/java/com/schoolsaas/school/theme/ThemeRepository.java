package com.schoolsaas.school.theme;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Tenant-scoped by the Hibernate tenantFilter (Theme extends
 * TenantOwnedEntity) - findAll() here only ever sees the caller's own
 * school's theme, and there is at most one row per school anyway (see the
 * unique constraint on school_id in V6). No custom derived-query method is
 * defined here deliberately: ThemeService just takes findAll().stream().findFirst()
 * - after getting burned twice this session by derived-query property
 * resolution surprises (findByIsHomeTrue, see PageRepository), a plain
 * findAll() isn't worth a bug for a table with at most one row per tenant.
 */
public interface ThemeRepository extends JpaRepository<Theme, Long> {
}
