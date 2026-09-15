package com.schoolsaas.platform.audit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolsaas.platform.security.CurrentUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Called directly from the services that perform sensitive actions
 * (SchoolService, DomainService, ThemeService, PageService,
 * SubscriptionService, ...) rather than via an AOP annotation - explicit
 * calls are more traceable for something like an audit trail, where
 * exactly what gets logged and with what metadata matters.
 */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * @param schoolId the AFFECTED school, if any - not necessarily the
     *                 actor's own tenant (e.g. a super admin suspending a
     *                 school they don't belong to). May be null for
     *                 platform-wide actions with no single affected school.
     */
    @Transactional
    public void record(String action, String entityType, Object entityId, Long schoolId, Map<String, Object> metadata) {
        AuditLog log = new AuditLog();
        log.setActorUserId(CurrentUser.userIdOrNull());
        log.setSchoolId(schoolId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId == null ? null : String.valueOf(entityId));
        log.setMetadataJson(metadata == null ? null : toJson(metadata));
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> listForSchool(Long schoolId, Pageable pageable) {
        return auditLogRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> listAll(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    private JsonNode toJson(Map<String, Object> metadata) {
        return objectMapper.valueToTree(metadata);
    }
}
