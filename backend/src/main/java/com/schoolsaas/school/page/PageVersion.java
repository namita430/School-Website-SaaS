package com.schoolsaas.school.page;

import com.fasterxml.jackson.databind.JsonNode;
import com.schoolsaas.platform.common.BaseEntity;
import com.schoolsaas.platform.common.JsonNodeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * One version (DRAFT or PUBLISHED) of a page's content. Exactly one row per
 * (page_id, status) - see V5 migration - upserted in place rather than
 * accumulating a full history, so "publish" always means "promote the
 * current draft to the current published version", not "add a new version
 * to a list".
 *
 * Deliberately NOT a TenantOwnedEntity: page_versions carries no school_id
 * column of its own (see V5 migration). Every access path goes through
 * PageService, which always resolves the parent Page first - and Page IS
 * tenant-owned, so that lookup is where tenant isolation is enforced. Never
 * query PageVersionRepository directly from a controller or with a raw
 * pageId that didn't come from an already-tenant-checked Page.
 */
@Getter
@Setter
@Entity
@Table(name = "page_versions", uniqueConstraints = @UniqueConstraint(columnNames = {"page_id", "status"}))
public class PageVersion extends BaseEntity {

    @Column(name = "page_id", nullable = false)
    private Long pageId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PageVersionStatus status;

    @Convert(converter = JsonNodeConverter.class)
    @Column(name = "content_json", nullable = false, columnDefinition = "json")
    private JsonNode contentJson;

    @Column(name = "published_at")
    private Instant publishedAt;
}
