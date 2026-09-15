package com.schoolsaas.platform.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    /** School-scoped read - explicit WHERE clause since AuditLog carries no Hibernate tenantFilter (see AuditLog's Javadoc). */
    Page<AuditLog> findBySchoolIdOrderByCreatedAtDesc(Long schoolId, Pageable pageable);
}
