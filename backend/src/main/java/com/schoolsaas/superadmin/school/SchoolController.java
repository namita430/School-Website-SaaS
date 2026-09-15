package com.schoolsaas.superadmin.school;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Platform-operator-only: every endpoint here requires the SUPER_ADMIN role,
 * enforced server-side via @PreAuthorize (never trust a frontend-only
 * check). A school's OWN admins never reach these endpoints - their access
 * is confined to /api/v1/schools/** (school-admin scope), introduced in
 * Phase 3.
 */
@RestController
@RequestMapping("/api/v1/superadmin/schools")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SchoolController {

    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @PostMapping
    public ResponseEntity<SchoolResponse> create(@Valid @RequestBody CreateSchoolRequest request) {
        School created = schoolService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(SchoolResponse.from(created));
    }

    @GetMapping
    public Page<SchoolResponse> list(@PageableDefault(size = 20) Pageable pageable) {
        return schoolService.list(pageable).map(SchoolResponse::from);
    }

    @GetMapping("/{id}")
    public SchoolResponse get(@PathVariable Long id) {
        return SchoolResponse.from(schoolService.getById(id));
    }

    @PutMapping("/{id}")
    public SchoolResponse update(@PathVariable Long id, @Valid @RequestBody UpdateSchoolRequest request) {
        return SchoolResponse.from(schoolService.update(id, request));
    }

    @PostMapping("/{id}/suspend")
    public SchoolResponse suspend(@PathVariable Long id) {
        return SchoolResponse.from(schoolService.suspend(id));
    }

    @PostMapping("/{id}/activate")
    public SchoolResponse activate(@PathVariable Long id) {
        return SchoolResponse.from(schoolService.activate(id));
    }
}
