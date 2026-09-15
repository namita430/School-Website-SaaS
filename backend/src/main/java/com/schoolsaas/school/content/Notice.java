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

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

/**
 * One of the 8 Phase 8 content modules. Per-type entity/repository/
 * service/controller/DTOs are deliberately consolidated into a single file
 * (all package-private except the framework-required public entity/
 * repository/controller types) rather than following the one-class-per-file
 * convention used elsewhere in this codebase - these 8 modules are
 * structurally identical CRUD, and 40+ near-empty files would add
 * navigation overhead without adding clarity. See
 * AbstractTenantContentService for the shared CRUD skeleton.
 */
@Getter
@Setter
@Entity
@Table(name = "notices")
public class Notice extends TenantOwnedEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "notice_date")
    private LocalDate noticeDate;

    @Column(nullable = false)
    private boolean pinned = false;
}

interface NoticeRepository extends JpaRepository<Notice, Long> {
}

@Service
class NoticeService extends AbstractTenantContentService<Notice> {
    NoticeService(NoticeRepository repository) {
        super(repository, Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("noticeDate")));
    }
}

record CreateNoticeRequest(@NotBlank @Size(max = 255) String title, String body, LocalDate noticeDate, boolean pinned) {
}

record UpdateNoticeRequest(@NotBlank @Size(max = 255) String title, String body, LocalDate noticeDate, boolean pinned) {
}

record NoticeResponse(Long id, String title, String body, LocalDate noticeDate, boolean pinned, Instant createdAt, Instant updatedAt) {
    static NoticeResponse from(Notice n) {
        return new NoticeResponse(n.getId(), n.getTitle(), n.getBody(), n.getNoticeDate(), n.isPinned(), n.getCreatedAt(), n.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/notices")
class NoticeController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final NoticeService service;

    NoticeController(NoticeService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NOTICE_CREATE')")
    ResponseEntity<NoticeResponse> create(@Valid @RequestBody CreateNoticeRequest req) {
        Notice n = new Notice();
        n.setTitle(req.title());
        n.setBody(req.body());
        n.setNoticeDate(req.noticeDate());
        n.setPinned(req.pinned());
        return ResponseEntity.status(HttpStatus.CREATED).body(NoticeResponse.from(service.create(n)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<NoticeResponse> list() {
        return service.list().stream().map(NoticeResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    NoticeResponse get(@PathVariable Long id) {
        return NoticeResponse.from(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NOTICE_EDIT')")
    NoticeResponse update(@PathVariable Long id, @Valid @RequestBody UpdateNoticeRequest req) {
        return NoticeResponse.from(service.update(id, n -> {
            n.setTitle(req.title());
            n.setBody(req.body());
            n.setNoticeDate(req.noticeDate());
            n.setPinned(req.pinned());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NOTICE_EDIT')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

/**
 * Unauthenticated public read, e.g. for the notice_board builder component.
 * Guards against an unresolved Host explicitly - without this check, a
 * request that reached here with no tenant resolved would return every
 * school's notices unfiltered, since the Hibernate tenantFilter is simply
 * left disabled when TenantContext holds no school id (see TenantFilterAspect).
 */
@RestController
@RequestMapping("/api/v1/public/notices")
class NoticePublicController {

    private final NoticeService service;

    NoticePublicController(NoticeService service) {
        this.service = service;
    }

    @GetMapping
    List<NoticeResponse> list(@RequestParam(defaultValue = "6") int limit) {
        if (!TenantContext.hasTenant()) {
            throw new NotFoundException("Site not found");
        }
        return service.list().stream().limit(limit).map(NoticeResponse::from).toList();
    }
}
