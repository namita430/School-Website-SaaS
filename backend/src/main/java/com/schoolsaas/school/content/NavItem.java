package com.schoolsaas.school.content;

import com.schoolsaas.platform.common.TenantOwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.repository.JpaRepository;
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

import java.time.Instant;
import java.util.List;

/**
 * Site navigation links - see Notice.java for why this whole module lives in
 * one file. Unlike the other content modules, order matters (sortOrder) and
 * there's no public list-of-all endpoint here directly: the public nav is
 * served by PublicSiteService.getNavigation(), which falls back to listing
 * published pages when a school hasn't configured any nav items yet.
 */
@Getter
@Setter
@Entity
@Table(name = "nav_items")
public class NavItem extends TenantOwnedEntity {

    @Column(nullable = false, length = 100)
    private String label;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
}

interface NavItemRepository extends JpaRepository<NavItem, Long> {
}

record CreateNavItemRequest(@NotBlank @Size(max = 100) String label, @NotBlank @Size(max = 500) String url, int sortOrder) {
}

record UpdateNavItemRequest(@NotBlank @Size(max = 100) String label, @NotBlank @Size(max = 500) String url, int sortOrder) {
}

record NavItemResponse(Long id, String label, String url, int sortOrder, Instant createdAt, Instant updatedAt) {
    static NavItemResponse from(NavItem n) {
        return new NavItemResponse(n.getId(), n.getLabel(), n.getUrl(), n.getSortOrder(), n.getCreatedAt(), n.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/navigation")
class NavItemController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final NavItemService service;

    NavItemController(NavItemService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NAVIGATION_MANAGE')")
    ResponseEntity<NavItemResponse> create(@Valid @RequestBody CreateNavItemRequest req) {
        NavItem n = new NavItem();
        n.setLabel(req.label());
        n.setUrl(req.url());
        n.setSortOrder(req.sortOrder());
        return ResponseEntity.status(HttpStatus.CREATED).body(NavItemResponse.from(service.create(n)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<NavItemResponse> list() {
        return service.list().stream().map(NavItemResponse::from).toList();
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NAVIGATION_MANAGE')")
    NavItemResponse update(@PathVariable Long id, @Valid @RequestBody UpdateNavItemRequest req) {
        return NavItemResponse.from(service.update(id, n -> {
            n.setLabel(req.label());
            n.setUrl(req.url());
            n.setSortOrder(req.sortOrder());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_NAVIGATION_MANAGE')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
