package com.schoolsaas.school.media;

import com.schoolsaas.platform.common.BadRequestException;
import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.platform.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;

@Service
public class MediaAssetService {

    private final MediaAssetRepository mediaAssetRepository;
    private final StorageService storageService;
    private final MediaProperties properties;

    public MediaAssetService(MediaAssetRepository mediaAssetRepository, StorageService storageService, MediaProperties properties) {
        this.mediaAssetRepository = mediaAssetRepository;
        this.storageService = storageService;
        this.properties = properties;
    }

    @Transactional
    public MediaAsset upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > properties.getMaxSizeBytes()) {
            throw new BadRequestException("File exceeds the maximum allowed size of "
                    + (properties.getMaxSizeBytes() / (1024 * 1024)) + "MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !properties.getAllowedContentTypes().contains(contentType)) {
            throw new BadRequestException("Unsupported file type: " + contentType);
        }

        // TenantOwnedEntity's @PrePersist fills school_id on the row itself,
        // but the storage key's tenant-scoped path needs it explicitly too.
        Long schoolId = TenantContext.getCurrentSchoolId();

        StorageService.StorageResult stored;
        try {
            stored = storageService.store(file, schoolId);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store uploaded file", e);
        }

        MediaAsset asset = new MediaAsset();
        asset.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload");
        asset.setStorageKey(stored.storageKey());
        asset.setUrl(stored.url());
        asset.setContentType(contentType);
        asset.setSizeBytes(file.getSize());
        return mediaAssetRepository.save(asset);
    }

    @Transactional(readOnly = true)
    public List<MediaAsset> list() {
        return mediaAssetRepository.findAll();
    }

    @Transactional
    public void delete(Long id) {
        MediaAsset asset = mediaAssetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Media asset " + id + " not found"));
        storageService.delete(asset.getStorageKey());
        mediaAssetRepository.delete(asset);
    }
}
