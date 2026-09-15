package com.schoolsaas.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchoolUserRepository extends JpaRepository<SchoolUser, Long> {

    /**
     * Deliberately unfiltered by design: at login time we need to see every
     * school a user belongs to, across tenants, to build their JWT claims.
     * TenantContext is not yet set at this point in the request (there is no
     * tenant to scope by until the user is authenticated), so the Hibernate
     * tenantFilter is not enabled here regardless - see TenantFilterAspect.
     */
    List<SchoolUser> findByUserId(Long userId);
}
