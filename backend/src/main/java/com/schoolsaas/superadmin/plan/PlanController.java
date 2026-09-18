package com.schoolsaas.superadmin.plan;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Global plan catalog management - SUPER_ADMIN only, via the existing PLATFORM_MANAGE permission. */
@RestController
@RequestMapping("/api/v1/superadmin/plans")
@PreAuthorize("hasAuthority('PERM_PLATFORM_MANAGE')")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @PostMapping
    public ResponseEntity<PlanResponse> create(@Valid @RequestBody CreatePlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(PlanResponse.from(planService.create(request)));
    }

    @GetMapping
    public List<PlanResponse> list() {
        return planService.listAll().stream().map(PlanResponse::from).toList();
    }

    @PostMapping("/{id}/activate")
    public PlanResponse activate(@PathVariable Long id) {
        return PlanResponse.from(planService.setActive(id, true));
    }

    @PostMapping("/{id}/deactivate")
    public PlanResponse deactivate(@PathVariable Long id) {
        return PlanResponse.from(planService.setActive(id, false));
    }

    @PutMapping("/{id}/templates")
    public PlanResponse updateTemplates(@PathVariable Long id, @Valid @RequestBody UpdatePlanTemplatesRequest request) {
        return PlanResponse.from(planService.setTemplates(id, request.templateIds()));
    }
}
