package com.schoolsaas.platform.audit;

import com.schoolsaas.platform.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * School-scoped audit log for school-admin apps - reuses SETTINGS_EDIT
 * (implies an elevated admin role) rather than adding yet another
 * permission. Explicitly filtered by TenantContext's school id via
 * AuditLogService.listForSchool, since AuditLog carries no automatic
 * Hibernate tenantFilter (see its Javadoc).
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("authentication.principal.schoolId != null and hasAuthority('PERM_SETTINGS_EDIT')")
    public Page<AuditLogResponse> list(@PageableDefault(size = 50) Pageable pageable) {
        return auditLogService.listForSchool(TenantContext.getCurrentSchoolId(), pageable)
                .map(AuditLogResponse::from);
    }
}
