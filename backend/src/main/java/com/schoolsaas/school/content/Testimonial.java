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
@Table(name = "testimonials")
public class Testimonial extends TenantOwnedEntity {

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_role")
    private String authorRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String quote;

    @Column(name = "photo_url", length = 1000)
    private String photoUrl;
}

interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
}

@Service
class TestimonialService extends AbstractTenantContentService<Testimonial> {
    TestimonialService(TestimonialRepository repository) {
        super(repository, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}

record CreateTestimonialRequest(@NotBlank @Size(max = 255) String authorName, String authorRole, @NotBlank String quote, String photoUrl) {
}

record UpdateTestimonialRequest(@NotBlank @Size(max = 255) String authorName, String authorRole, @NotBlank String quote, String photoUrl) {
}

record TestimonialResponse(Long id, String authorName, String authorRole, String quote, String photoUrl, Instant createdAt, Instant updatedAt) {
    static TestimonialResponse from(Testimonial t) {
        return new TestimonialResponse(t.getId(), t.getAuthorName(), t.getAuthorRole(), t.getQuote(), t.getPhotoUrl(), t.getCreatedAt(), t.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/testimonials")
class TestimonialController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final TestimonialService service;

    TestimonialController(TestimonialService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_TESTIMONIAL_MANAGE')")
    ResponseEntity<TestimonialResponse> create(@Valid @RequestBody CreateTestimonialRequest req) {
        Testimonial t = new Testimonial();
        t.setAuthorName(req.authorName());
        t.setAuthorRole(req.authorRole());
        t.setQuote(req.quote());
        t.setPhotoUrl(req.photoUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(TestimonialResponse.from(service.create(t)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<TestimonialResponse> list() {
        return service.list().stream().map(TestimonialResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    TestimonialResponse get(@PathVariable Long id) {
        return TestimonialResponse.from(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_TESTIMONIAL_MANAGE')")
    TestimonialResponse update(@PathVariable Long id, @Valid @RequestBody UpdateTestimonialRequest req) {
        return TestimonialResponse.from(service.update(id, t -> {
            t.setAuthorName(req.authorName());
            t.setAuthorRole(req.authorRole());
            t.setQuote(req.quote());
            t.setPhotoUrl(req.photoUrl());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_TESTIMONIAL_MANAGE')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

/** See NoticePublicController for why the tenant guard here is not optional. */
@RestController
@RequestMapping("/api/v1/public/testimonials")
class TestimonialPublicController {

    private final TestimonialService service;

    TestimonialPublicController(TestimonialService service) {
        this.service = service;
    }

    @GetMapping
    List<TestimonialResponse> list(@RequestParam(defaultValue = "6") int limit) {
        if (!TenantContext.hasTenant()) {
            throw new NotFoundException("Site not found");
        }
        return service.list().stream().limit(limit).map(TestimonialResponse::from).toList();
    }
}
