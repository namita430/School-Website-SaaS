package com.schoolsaas.school.theme;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * "My theme" - scoped by TenantContext like SchoolSelfController, not a
 * path id. Any school member can view; only THEME_EDIT holders can change
 * it (permission seeded back in V1/Phase 1, no new migration needed here).
 */
@RestController
@RequestMapping("/api/v1/themes/me")
public class ThemeController {

    private final ThemeService themeService;

    public ThemeController(ThemeService themeService) {
        this.themeService = themeService;
    }

    @GetMapping
    @PreAuthorize("authentication.principal.schoolId != null")
    public ThemeResponse get() {
        return ThemeResponse.from(themeService.getOrCreateForCurrentSchool());
    }

    @PutMapping
    @PreAuthorize("authentication.principal.schoolId != null and hasAuthority('PERM_THEME_EDIT')")
    public ThemeResponse update(@Valid @RequestBody UpdateThemeRequest request) {
        return ThemeResponse.from(themeService.update(request));
    }
}
