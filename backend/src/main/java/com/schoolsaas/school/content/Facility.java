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

/** See Notice.java for why this whole module lives in one file. */
@Getter
@Setter
@Entity
@Table(name = "facilities")
public class Facility extends TenantOwnedEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;
}

interface FacilityRepository extends JpaRepository<Facility, Long> {
}

@Service
class FacilityService extends AbstractTenantContentService<Facility> {
    FacilityService(FacilityRepository repository) {
        super(repository, Sort.by(Sort.Direction.ASC, "title"));
    }
}

record CreateFacilityRequest(@NotBlank @Size(max = 255) String title, String description, String imageUrl) {
}

record UpdateFacilityRequest(@NotBlank @Size(max = 255) String title, String description, String imageUrl) {
}

record FacilityResponse(Long id, String title, String description, String imageUrl, Instant createdAt, Instant updatedAt) {
    static FacilityResponse from(Facility f) {
        return new FacilityResponse(f.getId(), f.getTitle(), f.getDescription(), f.getImageUrl(), f.getCreatedAt(), f.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/facilities")
class FacilityController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final FacilityService service;

    FacilityController(FacilityService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_FACILITY_MANAGE')")
    ResponseEntity<FacilityResponse> create(@Valid @RequestBody CreateFacilityRequest req) {
        Facility f = new Facility();
        f.setTitle(req.title());
        f.setDescription(req.description());
        f.setImageUrl(req.imageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(FacilityResponse.from(service.create(f)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<FacilityResponse> list() {
        return service.list().stream().map(FacilityResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    FacilityResponse get(@PathVariable Long id) {
        return FacilityResponse.from(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_FACILITY_MANAGE')")
    FacilityResponse update(@PathVariable Long id, @Valid @RequestBody UpdateFacilityRequest req) {
        return FacilityResponse.from(service.update(id, f -> {
            f.setTitle(req.title());
            f.setDescription(req.description());
            f.setImageUrl(req.imageUrl());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_FACILITY_MANAGE')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

/** See NoticePublicController for why the tenant guard here is not optional. */
@RestController
@RequestMapping("/api/v1/public/facilities")
class FacilityPublicController {

    private final FacilityService service;

    FacilityPublicController(FacilityService service) {
        this.service = service;
    }

    @GetMapping
    List<FacilityResponse> list(@RequestParam(defaultValue = "24") int limit) {
        if (!TenantContext.hasTenant()) {
            throw new NotFoundException("Site not found");
        }
        return service.list().stream().limit(limit).map(FacilityResponse::from).toList();
    }
}
