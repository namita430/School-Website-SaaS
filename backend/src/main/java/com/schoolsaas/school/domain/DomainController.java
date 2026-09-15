package com.schoolsaas.school.domain;

import com.schoolsaas.platform.tenant.PublicSiteProperties;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Tenant-scoped by the Hibernate tenantFilter (Domain extends TenantOwnedEntity), gated by the DOMAIN_MANAGE permission (seeded back in Phase 1). */
@RestController
@RequestMapping("/api/v1/domains")
public class DomainController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final DomainService domainService;
    private final DnsVerificationService dnsVerificationService;
    private final PublicSiteProperties publicSiteProperties;

    public DomainController(DomainService domainService, DnsVerificationService dnsVerificationService, PublicSiteProperties publicSiteProperties) {
        this.domainService = domainService;
        this.dnsVerificationService = dnsVerificationService;
        this.publicSiteProperties = publicSiteProperties;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_DOMAIN_MANAGE')")
    public ResponseEntity<DomainResponse> create(@Valid @RequestBody CreateDomainRequest request) {
        Domain created = domainService.addDomain(request.domain());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_DOMAIN_MANAGE')")
    public List<DomainResponse> list() {
        return domainService.list().stream().map(this::toResponse).toList();
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_DOMAIN_MANAGE')")
    public DomainResponse verify(@PathVariable Long id) {
        return toResponse(domainService.verify(id));
    }

    @PostMapping("/{id}/set-primary")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_DOMAIN_MANAGE')")
    public DomainResponse setPrimary(@PathVariable Long id) {
        return toResponse(domainService.setPrimary(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_DOMAIN_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        domainService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private DomainResponse toResponse(Domain d) {
        return DomainResponse.from(d, dnsVerificationService.txtRecordNameFor(d.getDomain()), publicSiteProperties.getBaseDomain());
    }
}
