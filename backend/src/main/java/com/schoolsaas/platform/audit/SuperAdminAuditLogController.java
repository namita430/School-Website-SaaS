package com.schoolsaas.platform.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Platform-wide, unfiltered audit log - SUPER_ADMIN only. */
@RestController
@RequestMapping("/api/v1/superadmin/audit-logs")
@PreAuthorize("hasAuthority('PERM_PLATFORM_MANAGE')")
public class SuperAdminAuditLogController {

    private final AuditLogService auditLogService;

    public SuperAdminAuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public Page<AuditLogResponse> list(@PageableDefault(size = 50) Pageable pageable) {
        return auditLogService.listAll(pageable).map(AuditLogResponse::from);
    }
}
