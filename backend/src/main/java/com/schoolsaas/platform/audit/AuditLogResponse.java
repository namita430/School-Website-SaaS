package com.schoolsaas.platform.audit;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        Long actorUserId,
        Long schoolId,
        String action,
        String entityType,
        String entityId,
        JsonNode metadata,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(), log.getActorUserId(), log.getSchoolId(), log.getAction(),
                log.getEntityType(), log.getEntityId(), log.getMetadataJson(), log.getCreatedAt()
        );
    }
}
