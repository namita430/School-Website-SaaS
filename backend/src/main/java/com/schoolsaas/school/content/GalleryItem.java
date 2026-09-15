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

/** See Notice.java for why this whole module lives in one file. */
@Getter
@Setter
@Entity
@Table(name = "gallery_items")
public class GalleryItem extends TenantOwnedEntity {

    private String caption;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;
}

interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {
}

@Service
class GalleryItemService extends AbstractTenantContentService<GalleryItem> {
    GalleryItemService(GalleryItemRepository repository) {
        super(repository, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}

record CreateGalleryItemRequest(String caption, @NotBlank String imageUrl) {
}

record UpdateGalleryItemRequest(String caption, @NotBlank String imageUrl) {
}

record GalleryItemResponse(Long id, String caption, String imageUrl, Instant createdAt, Instant updatedAt) {
    static GalleryItemResponse from(GalleryItem g) {
        return new GalleryItemResponse(g.getId(), g.getCaption(), g.getImageUrl(), g.getCreatedAt(), g.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/gallery")
class GalleryItemController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final GalleryItemService service;

    GalleryItemController(GalleryItemService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_GALLERY_MANAGE')")
    ResponseEntity<GalleryItemResponse> create(@Valid @RequestBody CreateGalleryItemRequest req) {
        GalleryItem g = new GalleryItem();
        g.setCaption(req.caption());
        g.setImageUrl(req.imageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(GalleryItemResponse.from(service.create(g)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<GalleryItemResponse> list() {
        return service.list().stream().map(GalleryItemResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    GalleryItemResponse get(@PathVariable Long id) {
        return GalleryItemResponse.from(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_GALLERY_MANAGE')")
    GalleryItemResponse update(@PathVariable Long id, @Valid @RequestBody UpdateGalleryItemRequest req) {
        return GalleryItemResponse.from(service.update(id, g -> {
            g.setCaption(req.caption());
            g.setImageUrl(req.imageUrl());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_GALLERY_MANAGE')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

/** See NoticePublicController for why the tenant guard here is not optional. */
@RestController
@RequestMapping("/api/v1/public/gallery")
class GalleryItemPublicController {

    private final GalleryItemService service;

    GalleryItemPublicController(GalleryItemService service) {
        this.service = service;
    }

    @GetMapping
    List<GalleryItemResponse> list(@RequestParam(defaultValue = "24") int limit) {
        if (!TenantContext.hasTenant()) {
            throw new NotFoundException("Site not found");
        }
        return service.list().stream().limit(limit).map(GalleryItemResponse::from).toList();
    }
}
