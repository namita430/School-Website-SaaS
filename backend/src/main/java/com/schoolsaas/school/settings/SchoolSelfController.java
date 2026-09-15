package com.schoolsaas.school.settings;

import com.schoolsaas.platform.tenant.TenantContext;
import com.schoolsaas.superadmin.school.School;
import com.schoolsaas.superadmin.school.SchoolResponse;
import com.schoolsaas.superadmin.school.SchoolService;
import com.schoolsaas.superadmin.school.UpdateSchoolRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * "My school" endpoints for the School Admin app - scoped to whichever
 * school the caller's JWT resolved (see JwtAuthenticationFilter /
 * TenantContext), never by a path id. This is what keeps a school admin
 * from ever addressing another tenant's data by guessing an id: there is no
 * id parameter to guess.
 *
 * Reuses SchoolService (from the superadmin module) for the actual
 * read/write - cross-module service reuse is fine per the architecture;
 * only cross-module REPOSITORY access is disallowed. Authorization here is
 * what distinguishes this from the superadmin endpoints: any authenticated
 * school member can view, only SETTINGS_EDIT holders can update.
 */
@RestController
@RequestMapping("/api/v1/schools/me")
public class SchoolSelfController {

    private final SchoolService schoolService;

    public SchoolSelfController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @GetMapping
    @PreAuthorize("authentication.principal.schoolId != null")
    public SchoolResponse get() {
        return SchoolResponse.from(schoolService.getById(currentSchoolId()));
    }

    @PutMapping
    @PreAuthorize("authentication.principal.schoolId != null and hasAuthority('PERM_SETTINGS_EDIT')")
    public SchoolResponse update(@Valid @RequestBody UpdateSchoolRequest request) {
        School updated = schoolService.update(currentSchoolId(), request);
        return SchoolResponse.from(updated);
    }

    private Long currentSchoolId() {
        // Set by JwtAuthenticationFilter from the access token's schoolId
        // claim earlier in the request; guaranteed non-null here because
        // the @PreAuthorize check above already required it.
        return TenantContext.getCurrentSchoolId();
    }
}
