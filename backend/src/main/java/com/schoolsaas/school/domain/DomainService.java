package com.schoolsaas.school.domain;

import com.schoolsaas.platform.audit.AuditLogService;
import com.schoolsaas.platform.common.BadRequestException;
import com.schoolsaas.platform.common.ConflictException;
import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.platform.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * A domain string must be unique across the WHOLE platform, not just within
 * one school - two schools must never both claim "abcschool.com". Every
 * other query here relies on the Hibernate tenantFilter (enabled from
 * TenantContext) to stay scoped to the caller's own school, same as every
 * other content module. The uniqueness check is the one deliberate
 * exception: it explicitly disables the filter for that single query, then
 * re-enables it - documented here as the "super-admin-scoped services that
 * deliberately disable the filter" case TenantOwnedEntity's Javadoc
 * anticipated, even though this isn't a super-admin service.
 */
@Service
public class DomainService {

    private static final Pattern DOMAIN_PATTERN =
            Pattern.compile("^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\\.[A-Za-z0-9-]{1,63})+$");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final DomainRepository domainRepository;
    private final DnsVerificationService dnsVerificationService;
    private final EntityManager entityManager;
    private final AuditLogService auditLogService;

    public DomainService(DomainRepository domainRepository, DnsVerificationService dnsVerificationService,
                          EntityManager entityManager, AuditLogService auditLogService) {
        this.domainRepository = domainRepository;
        this.dnsVerificationService = dnsVerificationService;
        this.entityManager = entityManager;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public Domain addDomain(String rawDomain) {
        String domain = rawDomain == null ? "" : rawDomain.trim().toLowerCase();
        if (!DOMAIN_PATTERN.matcher(domain).matches()) {
            throw new BadRequestException("'" + rawDomain + "' is not a valid domain name");
        }
        if (existsAcrossAllTenants(domain)) {
            throw new ConflictException("This domain is already registered to a school on this platform");
        }

        Domain d = new Domain();
        d.setDomain(domain);
        d.setType(DomainType.CUSTOM);
        d.setVerificationToken(generateToken());
        d.setVerificationStatus(VerificationStatus.PENDING);
        d.setSslStatus(SslStatus.NONE);
        d = domainRepository.save(d);
        auditLogService.record("DOMAIN_ADDED", "Domain", d.getId(), TenantContext.getCurrentSchoolId(), Map.of("domain", domain));
        return d;
    }

    @Transactional(readOnly = true)
    public List<Domain> list() {
        return domainRepository.findAll();
    }

    /** Performs a real DNS TXT lookup (see DnsVerificationService) - not a rubber stamp. */
    @Transactional
    public Domain verify(Long id) {
        Domain domain = getById(id);
        boolean verified = dnsVerificationService.verifyTxtRecord(domain.getDomain(), domain.getVerificationToken());
        domain.setVerificationStatus(verified ? VerificationStatus.VERIFIED : VerificationStatus.FAILED);
        if (verified) {
            // Real certificate issuance needs a reverse proxy/ACME client
            // this dev environment doesn't have - see SslStatus's Javadoc.
            domain.setSslStatus(SslStatus.PROVISIONING);
        }
        domain = domainRepository.save(domain);
        auditLogService.record("DOMAIN_VERIFY_ATTEMPTED", "Domain", id, TenantContext.getCurrentSchoolId(),
                Map.of("domain", domain.getDomain(), "result", domain.getVerificationStatus().name()));
        return domain;
    }

    @Transactional
    public Domain setPrimary(Long id) {
        Domain target = getById(id);
        if (target.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException("Only a verified domain can be set as primary");
        }
        for (Domain d : domainRepository.findAll()) {
            if (d.isPrimary() && !d.getId().equals(id)) {
                d.setPrimary(false);
                domainRepository.save(d);
            }
        }
        target.setPrimary(true);
        target = domainRepository.save(target);
        auditLogService.record("DOMAIN_SET_PRIMARY", "Domain", id, TenantContext.getCurrentSchoolId(), Map.of("domain", target.getDomain()));
        return target;
    }

    @Transactional
    public void delete(Long id) {
        Domain domain = getById(id);
        domainRepository.delete(domain);
        auditLogService.record("DOMAIN_REMOVED", "Domain", id, TenantContext.getCurrentSchoolId(), Map.of("domain", domain.getDomain()));
    }

    private Domain getById(Long id) {
        return domainRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Domain " + id + " not found"));
    }

    private boolean existsAcrossAllTenants(String domain) {
        Session session = entityManager.unwrap(Session.class);
        boolean wasEnabled = session.getEnabledFilter("tenantFilter") != null;
        if (wasEnabled) {
            session.disableFilter("tenantFilter");
        }
        try {
            return domainRepository.existsByDomainIgnoreCase(domain);
        } finally {
            if (wasEnabled) {
                session.enableFilter("tenantFilter").setParameter("schoolId", TenantContext.getCurrentSchoolId());
            }
        }
    }

    private static String generateToken() {
        byte[] bytes = new byte[24];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
