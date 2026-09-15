package com.schoolsaas.school.content;

import com.schoolsaas.platform.common.AbstractTenantContentService;
import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.platform.common.TenantOwnedEntity;
import com.schoolsaas.platform.tenant.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

/**
 * See Notice.java for why this whole module lives in one file. Named
 * Download (singular) despite the plural "downloads" table/endpoint, for
 * consistency with the other entity class names in this package.
 */
@Getter
@Setter
@Entity
@Table(name = "downloads")
public class Download extends TenantOwnedEntity {

    @Column(nullable = false)
    private String title;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    private String category;
}

interface DownloadRepository extends JpaRepository<Download, Long> {
}

@Service
class DownloadService extends AbstractTenantContentService<Download> {
    DownloadService(DownloadRepository repository) {
        super(repository, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}

record CreateDownloadRequest(@NotBlank @Size(max = 255) String title, @NotBlank String fileUrl, String category) {
}

record UpdateDownloadRequest(@NotBlank @Size(max = 255) String title, @NotBlank String fileUrl, String category) {
}

record DownloadResponse(Long id, String title, String fileUrl, String category, Instant createdAt, Instant updatedAt) {
    static DownloadResponse from(Download d) {
        return new DownloadResponse(d.getId(), d.getTitle(), d.getFileUrl(), d.getCategory(), d.getCreatedAt(), d.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/downloads")
class DownloadController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final DownloadService service;

    DownloadController(DownloadService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_DOWNLOAD_MANAGE')")
    ResponseEntity<DownloadResponse> create(@Valid @RequestBody CreateDownloadRequest req) {
        Download d = new Download();
        d.setTitle(req.title());
        d.setFileUrl(req.fileUrl());
        d.setCategory(req.category());
        return ResponseEntity.status(HttpStatus.CREATED).body(DownloadResponse.from(service.create(d)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<DownloadResponse> list() {
        return service.list().stream().map(DownloadResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    DownloadResponse get(@PathVariable Long id) {
        return DownloadResponse.from(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_DOWNLOAD_MANAGE')")
    DownloadResponse update(@PathVariable Long id, @Valid @RequestBody UpdateDownloadRequest req) {
        return DownloadResponse.from(service.update(id, d -> {
            d.setTitle(req.title());
            d.setFileUrl(req.fileUrl());
            d.setCategory(req.category());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_DOWNLOAD_MANAGE')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

/** See NoticePublicController for why the tenant guard here is not optional. */
@RestController
@RequestMapping("/api/v1/public/downloads")
class DownloadPublicController {

    private final DownloadService service;

    DownloadPublicController(DownloadService service) {
        this.service = service;
    }

    @GetMapping
    List<DownloadResponse> list(@RequestParam(defaultValue = "50") int limit) {
        if (!TenantContext.hasTenant()) {
            throw new NotFoundException("Site not found");
        }
        return service.list().stream().limit(limit).map(DownloadResponse::from).toList();
    }
}
