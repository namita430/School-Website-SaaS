package com.schoolsaas.school.media;

import com.schoolsaas.platform.common.TenantOwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Metadata for one uploaded file - the file bytes themselves live wherever
 * {@link StorageService} put them (local disk today), never in this table.
 */
@Getter
@Setter
@Entity
@Table(name = "media_assets")
public class MediaAsset extends TenantOwnedEntity {

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;
}
