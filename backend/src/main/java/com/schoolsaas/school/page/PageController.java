package com.schoolsaas.school.page;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Tenant-scoped by the Hibernate tenantFilter (see Page/TenantOwnedEntity) -
 * every method here implicitly only ever sees the caller's own school's
 * pages, so path ids alone cannot be used to reach another tenant's data.
 *
 * Each method repeats the "authentication.principal.schoolId != null" check
 * alongside its permission check rather than relying on a class-level
 * @PreAuthorize, because Spring Security method security does not combine a
 * class-level @PreAuthorize with a method-level one - the method-level
 * annotation replaces it entirely, it does not AND with it.
 */
@RestController
@RequestMapping("/api/v1/pages")
public class PageController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final PageService pageService;

    public PageController(PageService pageService) {
        this.pageService = pageService;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_PAGE_CREATE')")
    public ResponseEntity<PageResponse> create(@Valid @RequestBody CreatePageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pageService.create(request));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    public List<PageResponse> list() {
        return pageService.list();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    public PageResponse get(@PathVariable Long id) {
        return pageService.get(id);
    }

    @PutMapping("/{id}/seo")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_PAGE_EDIT')")
    public PageResponse updateSeo(@PathVariable Long id, @RequestBody UpdatePageSeoRequest request) {
        return pageService.updateSeo(id, request);
    }

    @PutMapping("/{id}/content")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_PAGE_EDIT')")
    public PageResponse updateDraftContent(@PathVariable Long id, @Valid @RequestBody UpdatePageContentRequest request) {
        return pageService.updateDraftContent(id, request);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_PAGE_EDIT')")
    public PageResponse publish(@PathVariable Long id) {
        return pageService.publish(id);
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_PAGE_EDIT')")
    public PageResponse unpublish(@PathVariable Long id) {
        return pageService.unpublish(id);
    }

    @PostMapping("/{id}/set-home")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_PAGE_EDIT')")
    public PageResponse setHome(@PathVariable Long id) {
        return pageService.setHome(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_PAGE_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
