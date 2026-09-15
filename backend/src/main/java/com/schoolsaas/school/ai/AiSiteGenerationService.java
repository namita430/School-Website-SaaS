package com.schoolsaas.school.ai;

import com.schoolsaas.platform.tenant.TenantContext;
import com.schoolsaas.school.page.CreatePageRequest;
import com.schoolsaas.school.page.PageService;
import com.schoolsaas.school.page.UpdatePageContentRequest;
import com.schoolsaas.school.theme.ThemeService;
import com.schoolsaas.school.theme.UpdateThemeRequest;
import com.schoolsaas.superadmin.school.School;
import com.schoolsaas.superadmin.school.SchoolService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Orchestrates AiContentGenerator + the existing PageService/ThemeService -
 * reuses their services (cross-module reuse, consistent with every other
 * module in this codebase) rather than writing pages/theme directly. Idempotent
 * by design: a page whose slug already exists is skipped, not overwritten -
 * running generation twice, or on a school that already has some pages,
 * never destroys existing content.
 *
 * Checks existsBySlug() before calling create() rather than catching the
 * ConflictException create() throws - both methods are @Transactional and
 * participate in the SAME physical transaction as this method (default
 * REQUIRED propagation), so an exception thrown by the nested create() call
 * marks that shared transaction rollback-only via its OWN transactional
 * advice before ever reaching a catch block here; the whole request then
 * fails on commit with UnexpectedRollbackException regardless of the catch.
 * See PageService.existsBySlug's Javadoc.
 */
@Service
public class AiSiteGenerationService {

    private final AiContentGenerator generator;
    private final PageService pageService;
    private final ThemeService themeService;
    private final SchoolService schoolService;

    public AiSiteGenerationService(AiContentGenerator generator, PageService pageService,
                                    ThemeService themeService, SchoolService schoolService) {
        this.generator = generator;
        this.pageService = pageService;
        this.themeService = themeService;
        this.schoolService = schoolService;
    }

    @Transactional
    public GenerateSiteResponse generate(GenerateSiteRequest request) {
        School school = schoolService.getById(TenantContext.getCurrentSchoolId());

        AiContentGenerator.GenerationInput input = new AiContentGenerator.GenerationInput(
                school.getName(), request.schoolType(), request.location(), request.style(), request.primaryColor());
        AiContentGenerator.GeneratedSite site = generator.generate(input);

        List<String> created = new ArrayList<>();
        List<String> skipped = new ArrayList<>();

        for (AiContentGenerator.GeneratedPage generatedPage : site.pages()) {
            if (pageService.existsBySlug(generatedPage.slug())) {
                skipped.add(generatedPage.slug());
                continue;
            }
            var page = pageService.create(new CreatePageRequest(generatedPage.title(), generatedPage.slug()));
            pageService.updateDraftContent(page.id(), new UpdatePageContentRequest(generatedPage.contentJson()));
            created.add(generatedPage.slug());
        }

        themeService.update(new UpdateThemeRequest(site.themeTokens()));

        return new GenerateSiteResponse(created, skipped, true);
    }
}
