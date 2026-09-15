package com.schoolsaas.platform.tenant;

import jakarta.persistence.EntityManager;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Session;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Enables the Hibernate {@code tenantFilter} (declared on
 * {@link com.schoolsaas.platform.common.TenantOwnedEntity}) for the current
 * persistence-context Session, scoped to whatever school id is currently in
 * {@link TenantContext}.
 *
 * Runs around every public method of a Spring-managed {@code @Service} bean,
 * ordered (via {@link JpaConfig}) to execute INSIDE the transaction opened
 * by {@code @Transactional} so a Session is already bound to the thread.
 *
 * When {@link TenantContext} holds no school id (super-admin requests, or
 * pre-authentication lookups such as login), the filter is deliberately
 * left disabled - Hibernate then runs queries unfiltered, which is the
 * correct behavior for those callers. Application code must never rely on
 * this as a substitute for an explicit authorization check; it only
 * prevents cross-tenant data leakage for callers that ARE scoped to a
 * school.
 */
@Aspect
@Component
@Order(1)
public class TenantFilterAspect {

    private final EntityManager entityManager;

    public TenantFilterAspect(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Around("within(@org.springframework.stereotype.Service *)")
    public Object enableTenantFilter(ProceedingJoinPoint joinPoint) throws Throwable {
        Long schoolId = TenantContext.getCurrentSchoolId();
        if (schoolId != null) {
            Session session = entityManager.unwrap(Session.class);
            if (session.getEnabledFilter("tenantFilter") == null) {
                session.enableFilter("tenantFilter").setParameter("schoolId", schoolId);
            }
        }
        return joinPoint.proceed();
    }
}
