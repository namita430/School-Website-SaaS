package com.schoolsaas.school.template;

import com.schoolsaas.platform.tenant.TenantContext;
import com.schoolsaas.superadmin.plan.PlanService;
import com.schoolsaas.superadmin.school.School;
import com.schoolsaas.superadmin.school.SchoolService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** School admins receive only template IDs granted by their school plan. */
@RestController
@RequestMapping("/api/v1/school/templates")
@PreAuthorize("hasAuthority('PERM_THEME_EDIT')")
public class SchoolTemplateController {

    private final SchoolService schoolService;
    private final PlanService planService;

    public SchoolTemplateController(SchoolService schoolService, PlanService planService) {
        this.schoolService = schoolService;
        this.planService = planService;
    }

    @GetMapping
    public List<String> availableTemplates() {
        School school = schoolService.getById(TenantContext.getCurrentSchoolId());
        if (school.getPlanId() == null) {
            return List.of();
        }
        return List.copyOf(planService.getById(school.getPlanId()).getTemplateIds());
    }
}
