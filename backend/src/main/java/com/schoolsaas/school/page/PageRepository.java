package com.schoolsaas.school.page;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Every method here is implicitly scoped to the current tenant via the
 * Hibernate tenantFilter (Page extends TenantOwnedEntity) - see
 * TenantFilterAspect. No method here needs to accept or check a school id
 * itself.
 */
public interface PageRepository extends JpaRepository<Page, Long> {
    Optional<Page> findBySlug(String slug);
    boolean existsBySlug(String slug);
    // The JPA attribute name matches the Java FIELD name (field access, the
    // JPA default given @Id lives on a field) - which is literally "isHome",
    // not "home". Despite JavaBean introspection normally stripping "is"
    // from a boolean getter, Spring Data resolves this against the JPA
    // metamodel attribute name, so findByHomeTrue() fails at startup with
    // "Could not resolve attribute 'home'" - confirmed by actually running
    // this against a live database. Keep this method name as-is.
    Optional<Page> findByIsHomeTrue();
}
