package com.schoolsaas.superadmin.school;

import com.schoolsaas.platform.audit.AuditLogService;
import com.schoolsaas.platform.common.ConflictException;
import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.superadmin.plan.PlanService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * School is not a TenantOwnedEntity (it IS the tenant), so none of these
 * methods are scoped by TenantContext/tenantFilter - they are only reachable
 * via SUPER_ADMIN-authorized endpoints (see SchoolController), which is
 * where tenant isolation for this module is enforced instead.
 */
@Service
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final AuditLogService auditLogService;
    private final PlanService planService;

    public SchoolService(SchoolRepository schoolRepository, AuditLogService auditLogService, PlanService planService) {
        this.schoolRepository = schoolRepository;
        this.auditLogService = auditLogService;
        this.planService = planService;
    }

    @Transactional
    public School create(CreateSchoolRequest request) {
        if (schoolRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A school with slug '" + request.slug() + "' already exists");
        }
        School school = new School();
        school.setName(request.name());
        school.setSlug(request.slug());
        school.setStatus(SchoolStatus.ACTIVE);
        return schoolRepository.save(school);
    }

    @Transactional(readOnly = true)
    public Page<School> list(Pageable pageable) {
        return schoolRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public School getById(Long id) {
        return schoolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("School " + id + " not found"));
    }

    @Transactional
    public School update(Long id, UpdateSchoolRequest request) {
        School school = getById(id);
        school.setName(request.name());
        return schoolRepository.save(school);
    }

    @Transactional
    public School suspend(Long id) {
        School school = getById(id);
        school.setStatus(SchoolStatus.SUSPENDED);
        school = schoolRepository.save(school);
        auditLogService.record("SCHOOL_SUSPENDED", "School", id, id, Map.of("slug", school.getSlug()));
        return school;
    }

    @Transactional
    public School activate(Long id) {
        School school = getById(id);
        school.setStatus(SchoolStatus.ACTIVE);
        school = schoolRepository.save(school);
        auditLogService.record("SCHOOL_ACTIVATED", "School", id, id, Map.of("slug", school.getSlug()));
        return school;
    }

    @Transactional
    public School assignPlan(Long id, Long planId) {
        School school = getById(id);
        planService.getById(planId);
        school.setPlanId(planId);
        school = schoolRepository.save(school);
        auditLogService.record("SCHOOL_PLAN_ASSIGNED", "School", id, id, Map.of("planId", planId));
        return school;
    }
}
