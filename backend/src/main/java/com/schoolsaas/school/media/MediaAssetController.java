package com.schoolsaas.school.media;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Tenant-scoped by the Hibernate tenantFilter (MediaAsset extends
 * TenantOwnedEntity), same as every other content module.
 */
@RestController
@RequestMapping("/api/v1/media")
public class MediaAssetController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final MediaAssetService mediaAssetService;

    public MediaAssetController(MediaAssetService mediaAssetService) {
        this.mediaAssetService = mediaAssetService;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_MEDIA_UPLOAD')")
    public ResponseEntity<MediaAssetResponse> upload(@RequestParam("file") MultipartFile file) {
        MediaAsset asset = mediaAssetService.upload(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(MediaAssetResponse.from(asset));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    public List<MediaAssetResponse> list() {
        return mediaAssetService.list().stream().map(MediaAssetResponse::from).toList();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_MEDIA_UPLOAD')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mediaAssetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
