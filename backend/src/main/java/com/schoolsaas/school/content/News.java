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

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

/** See Notice.java for why this whole module lives in one file. */
@Getter
@Setter
@Entity
@Table(name = "news")
public class News extends TenantOwnedEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "published_date")
    private LocalDate publishedDate;
}

interface NewsRepository extends JpaRepository<News, Long> {
}

@Service
class NewsService extends AbstractTenantContentService<News> {
    NewsService(NewsRepository repository) {
        super(repository, Sort.by(Sort.Direction.DESC, "publishedDate"));
    }
}

record CreateNewsRequest(@NotBlank @Size(max = 255) String title, String body, LocalDate publishedDate) {
}

record UpdateNewsRequest(@NotBlank @Size(max = 255) String title, String body, LocalDate publishedDate) {
}

record NewsResponse(Long id, String title, String body, LocalDate publishedDate, Instant createdAt, Instant updatedAt) {
    static NewsResponse from(News n) {
        return new NewsResponse(n.getId(), n.getTitle(), n.getBody(), n.getPublishedDate(), n.getCreatedAt(), n.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/news")
class NewsController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final NewsService service;

    NewsController(NewsService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NEWS_MANAGE')")
    ResponseEntity<NewsResponse> create(@Valid @RequestBody CreateNewsRequest req) {
        News n = new News();
        n.setTitle(req.title());
        n.setBody(req.body());
        n.setPublishedDate(req.publishedDate());
        return ResponseEntity.status(HttpStatus.CREATED).body(NewsResponse.from(service.create(n)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<NewsResponse> list() {
        return service.list().stream().map(NewsResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    NewsResponse get(@PathVariable Long id) {
        return NewsResponse.from(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NEWS_MANAGE')")
    NewsResponse update(@PathVariable Long id, @Valid @RequestBody UpdateNewsRequest req) {
        return NewsResponse.from(service.update(id, n -> {
            n.setTitle(req.title());
            n.setBody(req.body());
            n.setPublishedDate(req.publishedDate());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NEWS_MANAGE')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

/** See NoticePublicController for why the tenant guard here is not optional. */
@RestController
@RequestMapping("/api/v1/public/news")
class NewsPublicController {

    private final NewsService service;

    NewsPublicController(NewsService service) {
        this.service = service;
    }

    @GetMapping
    List<NewsResponse> list(@RequestParam(defaultValue = "6") int limit) {
        if (!TenantContext.hasTenant()) {
            throw new NotFoundException("Site not found");
        }
        return service.list().stream().limit(limit).map(NewsResponse::from).toList();
    }
}
