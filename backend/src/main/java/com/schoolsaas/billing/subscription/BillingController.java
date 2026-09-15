package com.schoolsaas.billing.subscription;

import com.schoolsaas.billing.payment.PaymentResponse;
import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.platform.tenant.TenantContext;
import com.schoolsaas.superadmin.plan.PlanResponse;
import com.schoolsaas.superadmin.plan.PlanService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

/**
 * School-admin-facing billing endpoints - tenant-scoped by TenantContext,
 * not a path id, same self-service pattern as SchoolSelfController/
 * ThemeController. Every method here requires BILLING_MANAGE, restricted to
 * SCHOOL_OWNER only (see V11 migration) since billing is more sensitive
 * than typical content/settings management.
 */
@RestController
@RequestMapping("/api/v1/billing")
@PreAuthorize("authentication.principal.schoolId != null and hasAuthority('PERM_BILLING_MANAGE')")
public class BillingController {

    private final PlanService planService;
    private final SubscriptionService subscriptionService;

    public BillingController(PlanService planService, SubscriptionService subscriptionService) {
        this.planService = planService;
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/plans")
    public List<PlanResponse> plans() {
        return planService.listActive().stream().map(PlanResponse::from).toList();
    }

    @GetMapping("/subscription")
    public Optional<SubscriptionResponse> subscription() {
        return subscriptionService.getCurrent().map(SubscriptionResponse::from);
    }

    @GetMapping("/payments")
    public List<PaymentResponse> payments() {
        return subscriptionService.listPayments().stream().map(PaymentResponse::from).toList();
    }

    @PostMapping("/subscribe")
    public SubscriptionResponse subscribe(@Valid @RequestBody SubscribeRequest request) {
        Long schoolId = TenantContext.getCurrentSchoolId();
        if (schoolId == null) {
            throw new NotFoundException("No school context");
        }
        return SubscriptionResponse.from(subscriptionService.subscribe(request.planId(), schoolId));
    }

    @PostMapping("/cancel")
    public SubscriptionResponse cancel() {
        return SubscriptionResponse.from(subscriptionService.cancel());
    }
}
