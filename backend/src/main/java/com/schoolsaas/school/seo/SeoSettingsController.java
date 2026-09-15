package com.schoolsaas.school.seo;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** "My SEO settings" - same TenantContext-scoped pattern as SchoolSelfController/ThemeController. */
@RestController
@RequestMapping("/api/v1/seo/me")
public class SeoSettingsController {

    private final SeoSettingsService seoSettingsService;

    public SeoSettingsController(SeoSettingsService seoSettingsService) {
        this.seoSettingsService = seoSettingsService;
    }

    @GetMapping
    @PreAuthorize("authentication.principal.schoolId != null")
    public SeoSettingsResponse get() {
        return SeoSettingsResponse.from(seoSettingsService.getOrCreateForCurrentSchool());
    }

    @PutMapping
    @PreAuthorize("authentication.principal.schoolId != null and hasAuthority('PERM_SETTINGS_EDIT')")
    public SeoSettingsResponse update(@Valid @RequestBody UpdateSeoSettingsRequest request) {
        return SeoSettingsResponse.from(seoSettingsService.update(request));
    }
}
