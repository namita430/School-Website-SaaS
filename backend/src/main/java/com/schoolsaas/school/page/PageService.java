package com.schoolsaas.school.page;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.schoolsaas.platform.audit.AuditLogService;
import com.schoolsaas.platform.common.BadRequestException;
import com.schoolsaas.platform.common.ConflictException;
import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.platform.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Owns both Page identity and its DRAFT/PUBLISHED PageVersion rows. Every
 * PageVersion lookup here goes through a Page fetched via PageRepository
 * first (tenant-filtered) - see the Javadoc on PageVersion for why that's
 * the tenant-isolation boundary for versions, which have no school_id of
 * their own.
 */
@Service
public class PageService {

    private final PageRepository pageRepository;
    private final PageVersionRepository pageVersionRepository;
    private final PageContentValidator contentValidator;
    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;

    public PageService(PageRepository pageRepository,
                        PageVersionRepository pageVersionRepository,
                        PageContentValidator contentValidator,
                        ObjectMapper objectMapper,
                        AuditLogService auditLogService) {
        this.pageRepository = pageRepository;
        this.pageVersionRepository = pageVersionRepository;
        this.contentValidator = contentValidator;
        this.objectMapper = objectMapper;
        this.auditLogService = auditLogService;
    }

    /**
     * Exposed so callers (e.g. AiSiteGenerationService) can check before
     * calling create() rather than catching the ConflictException it throws
     * - catching an exception from a nested @Transactional call does NOT
     * stop Spring from marking the shared transaction rollback-only (the
     * inner method's own transactional advice marks it before the
     * exception ever reaches an outer catch block), confirmed the hard way
     * live: UnexpectedRollbackException on the OUTER transaction's commit
     * even though the ConflictException itself was caught successfully.
     */
    @Transactional(readOnly = true)
    public boolean existsBySlug(String slug) {
        return pageRepository.existsBySlug(slug);
    }

    @Transactional
    public PageResponse create(CreatePageRequest request) {
        if (pageRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A page with slug '" + request.slug() + "' already exists");
        }
        Page page = new Page();
        page.setSlug(request.slug());
        page.setTitle(request.title());
        // First page created for a school automatically becomes the home page.
        page.setHome(pageRepository.count() == 0);
        page = pageRepository.save(page);

        PageVersion draft = new PageVersion();
        draft.setPageId(page.getId());
        draft.setStatus(PageVersionStatus.DRAFT);
        draft.setContentJson(emptyContent());
        draft = pageVersionRepository.save(draft);

        return PageResponse.from(page, draft, null);
    }

    @Transactional(readOnly = true)
    public List<PageResponse> list() {
        return pageRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse get(Long id) {
        return toResponse(getPageOrThrow(id));
    }

    @Transactional
    public PageResponse updateSeo(Long id, UpdatePageSeoRequest request) {
        Page page = getPageOrThrow(id);
        page.setMetaDescription(request.metaDescription());
        page.setOgImageUrl(request.ogImageUrl());
        page = pageRepository.save(page);
        return toResponse(page);
    }

    @Transactional
    public PageResponse updateDraftContent(Long id, UpdatePageContentRequest request) {
        Page page = getPageOrThrow(id);
        contentValidator.validate(request.content());

        PageVersion draft = pageVersionRepository.findByPageIdAndStatus(page.getId(), PageVersionStatus.DRAFT)
                .orElseGet(() -> newVersion(page.getId(), PageVersionStatus.DRAFT));
        draft.setContentJson(request.content());
        draft = pageVersionRepository.save(draft);

        PageVersion published = pageVersionRepository
                .findByPageIdAndStatus(page.getId(), PageVersionStatus.PUBLISHED).orElse(null);
        return PageResponse.from(page, draft, published);
    }

    /** Promotes the current DRAFT content to PUBLISHED, re-validating it first. */
    @Transactional
    public PageResponse publish(Long id) {
        Page page = getPageOrThrow(id);
        PageVersion draft = pageVersionRepository.findByPageIdAndStatus(page.getId(), PageVersionStatus.DRAFT)
                .orElseThrow(() -> new BadRequestException("Page has no draft content to publish"));
        contentValidator.validate(draft.getContentJson());

        PageVersion published = pageVersionRepository
                .findByPageIdAndStatus(page.getId(), PageVersionStatus.PUBLISHED)
                .orElseGet(() -> newVersion(page.getId(), PageVersionStatus.PUBLISHED));
        published.setContentJson(draft.getContentJson());
        published.setPublishedAt(Instant.now());
        published = pageVersionRepository.save(published);
        auditLogService.record("PAGE_PUBLISHED", "Page", id, TenantContext.getCurrentSchoolId(), Map.of("slug", page.getSlug()));

        return PageResponse.from(page, draft, published);
    }

    /** Takes the page offline - the public renderer will 404 it - without touching draft content. */
    @Transactional
    public PageResponse unpublish(Long id) {
        Page page = getPageOrThrow(id);
        pageVersionRepository.findByPageIdAndStatus(page.getId(), PageVersionStatus.PUBLISHED)
                .ifPresent(pageVersionRepository::delete);
        auditLogService.record("PAGE_UNPUBLISHED", "Page", id, TenantContext.getCurrentSchoolId(), Map.of("slug", page.getSlug()));

        PageVersion draft = pageVersionRepository.findByPageIdAndStatus(page.getId(), PageVersionStatus.DRAFT)
                .orElse(null);
        return PageResponse.from(page, draft, null);
    }

    @Transactional
    public PageResponse setHome(Long id) {
        Page target = getPageOrThrow(id);
        if (!target.isHome()) {
            pageRepository.findAll().stream()
                    .filter(Page::isHome)
                    .forEach(p -> {
                        p.setHome(false);
                        pageRepository.save(p);
                    });
            target.setHome(true);
            target = pageRepository.save(target);
        }
        return toResponse(target);
    }

    /**
     * Public-renderer read path: the current tenant's home page's PUBLISHED
     * content, or empty if there is no home page or it isn't published.
     * Callers (PublicSiteService) must ensure TenantContext is already set
     * from the resolved Host before calling this - see TenantResolutionFilter.
     */
    @Transactional(readOnly = true)
    public Optional<PublishedPageContent> getPublishedHomePage() {
        return pageRepository.findByIsHomeTrue().flatMap(this::toPublishedContent);
    }

    /** Public-renderer read path: a specific page's PUBLISHED content by slug. */
    @Transactional(readOnly = true)
    public Optional<PublishedPageContent> getPublishedBySlug(String slug) {
        return pageRepository.findBySlug(slug).flatMap(this::toPublishedContent);
    }

    /** Every published page, for sitemap generation - see PublicSiteService.getSitemapXml(). */
    @Transactional(readOnly = true)
    public List<PublishedPageContent> listPublished() {
        return pageRepository.findAll().stream().flatMap(page -> toPublishedContent(page).stream()).toList();
    }

    private Optional<PublishedPageContent> toPublishedContent(Page page) {
        return pageVersionRepository.findByPageIdAndStatus(page.getId(), PageVersionStatus.PUBLISHED)
                .map(v -> new PublishedPageContent(
                        page.getSlug(), page.getTitle(), page.getMetaDescription(), page.getOgImageUrl(),
                        v.getContentJson(), v.getPublishedAt()));
    }

    public record PublishedPageContent(String slug, String title, String metaDescription, String ogImageUrl,
                                        JsonNode contentJson, Instant publishedAt) {
    }

    @Transactional
    public void delete(Long id) {
        Page page = getPageOrThrow(id);
        if (page.isHome()) {
            throw new BadRequestException("Cannot delete the home page - set another page as home first");
        }
        pageRepository.delete(page);
    }

    private Page getPageOrThrow(Long id) {
        return pageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Page " + id + " not found"));
    }

    private PageResponse toResponse(Page page) {
        PageVersion draft = pageVersionRepository
                .findByPageIdAndStatus(page.getId(), PageVersionStatus.DRAFT).orElse(null);
        PageVersion published = pageVersionRepository
                .findByPageIdAndStatus(page.getId(), PageVersionStatus.PUBLISHED).orElse(null);
        return PageResponse.from(page, draft, published);
    }

    private PageVersion newVersion(Long pageId, PageVersionStatus status) {
        PageVersion version = new PageVersion();
        version.setPageId(pageId);
        version.setStatus(status);
        return version;
    }

    private JsonNode emptyContent() {
        ObjectNode content = objectMapper.createObjectNode();
        content.putArray("sections");
        return content;
    }
}
