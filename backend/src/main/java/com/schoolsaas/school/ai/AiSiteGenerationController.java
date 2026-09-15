package com.schoolsaas.school.ai;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Requires both PAGE_CREATE and THEME_EDIT since generation creates pages
 * AND applies a theme - a caller with only one of those permissions (there
 * isn't one today, but EDITOR/SCHOOL_OWNER/SCHOOL_ADMIN all have both) would
 * get a 403 rather than a partial, confusing result.
 */
@RestController
@RequestMapping("/api/v1/ai")
public class AiSiteGenerationController {

    private final AiSiteGenerationService aiSiteGenerationService;

    public AiSiteGenerationController(AiSiteGenerationService aiSiteGenerationService) {
        this.aiSiteGenerationService = aiSiteGenerationService;
    }

    @PostMapping("/generate-site")
    @PreAuthorize("authentication.principal.schoolId != null and hasAuthority('PERM_PAGE_CREATE') and hasAuthority('PERM_THEME_EDIT')")
    public GenerateSiteResponse generateSite(@RequestBody GenerateSiteRequest request) {
        return aiSiteGenerationService.generate(request);
    }
}
