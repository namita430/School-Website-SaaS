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
@Table(name = "teachers")
public class Teacher extends TenantOwnedEntity {

    @Column(nullable = false)
    private String name;

    private String designation;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url", length = 1000)
    private String photoUrl;
}

interface TeacherRepository extends JpaRepository<Teacher, Long> {
}

@Service
class TeacherService extends AbstractTenantContentService<Teacher> {
    TeacherService(TeacherRepository repository) {
        super(repository, Sort.by(Sort.Direction.ASC, "name"));
    }
}

record CreateTeacherRequest(@NotBlank @Size(max = 255) String name, String designation, String bio, String photoUrl) {
}

record UpdateTeacherRequest(@NotBlank @Size(max = 255) String name, String designation, String bio, String photoUrl) {
}

record TeacherResponse(Long id, String name, String designation, String bio, String photoUrl, Instant createdAt, Instant updatedAt) {
    static TeacherResponse from(Teacher t) {
        return new TeacherResponse(t.getId(), t.getName(), t.getDesignation(), t.getBio(), t.getPhotoUrl(), t.getCreatedAt(), t.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/teachers")
class TeacherController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final TeacherService service;

    TeacherController(TeacherService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_TEACHER_MANAGE')")
    ResponseEntity<TeacherResponse> create(@Valid @RequestBody CreateTeacherRequest req) {
        Teacher t = new Teacher();
        t.setName(req.name());
        t.setDesignation(req.designation());
        t.setBio(req.bio());
        t.setPhotoUrl(req.photoUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(TeacherResponse.from(service.create(t)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<TeacherResponse> list() {
        return service.list().stream().map(TeacherResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    TeacherResponse get(@PathVariable Long id) {
        return TeacherResponse.from(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_TEACHER_MANAGE')")
    TeacherResponse update(@PathVariable Long id, @Valid @RequestBody UpdateTeacherRequest req) {
        return TeacherResponse.from(service.update(id, t -> {
            t.setName(req.name());
            t.setDesignation(req.designation());
            t.setBio(req.bio());
            t.setPhotoUrl(req.photoUrl());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_TEACHER_MANAGE')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

/** See NoticePublicController for why the tenant guard here is not optional. */
@RestController
@RequestMapping("/api/v1/public/teachers")
class TeacherPublicController {

    private final TeacherService service;

    TeacherPublicController(TeacherService service) {
        this.service = service;
    }

    @GetMapping
    List<TeacherResponse> list(@RequestParam(defaultValue = "24") int limit) {
        if (!TenantContext.hasTenant()) {
            throw new NotFoundException("Site not found");
        }
        return service.list().stream().limit(limit).map(TeacherResponse::from).toList();
    }
}
