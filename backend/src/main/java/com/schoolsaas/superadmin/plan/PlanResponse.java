package com.schoolsaas.superadmin.plan;

import java.util.List;

public record PlanResponse(Long id, String code, String name, int priceCents, BillingInterval billingInterval, boolean isActive, List<String> templateIds) {
    public static PlanResponse from(Plan p) {
        return new PlanResponse(p.getId(), p.getCode(), p.getName(), p.getPriceCents(), p.getBillingInterval(), p.isActive(), List.copyOf(p.getTemplateIds()));
    }
}
