package com.schoolsaas.platform.audit;

import com.fasterxml.jackson.databind.JsonNode;
import com.schoolsaas.platform.common.JsonNodeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import jakarta.persistence.Convert;
import jakarta.persistence.EntityListeners;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Deliberately does NOT extend TenantOwnedEntity (see V12 migration's
 * comment) - school_id is a plain nullable column with no Hibernate
 * tenantFilter, since the actor writing a row (e.g. a super admin
 * suspending a school) often does not belong to the affected school's
 * tenant. AuditLogService applies an explicit "WHERE school_id = ?" for
 * school-scoped reads instead of relying on the filter.
 */
@Getter
@Setter
@Entity
@Table(name = "audit_logs")
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Column(name = "school_id")
    private Long schoolId;

    @Column(nullable = false)
    private String action;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    @Convert(converter = JsonNodeConverter.class)
    @Column(name = "metadata_json", columnDefinition = "json")
    private JsonNode metadataJson;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
