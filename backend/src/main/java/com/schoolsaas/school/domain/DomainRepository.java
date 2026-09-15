package com.schoolsaas.school.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DomainRepository extends JpaRepository<Domain, Long> {

    boolean existsByDomainIgnoreCase(String domain);

    /**
     * Used by TenantResolutionFilter with no TenantContext set yet (that's
     * the whole point - find out WHICH school this hostname belongs to) so
     * the Hibernate tenantFilter is naturally left disabled for this call,
     * same reasoning as SchoolUserRepository.findByUserId at login time.
     */
    Optional<Domain> findByDomainIgnoreCaseAndVerificationStatus(String domain, VerificationStatus status);
}
