package com.schoolsaas.superadmin.plan;

public record PlanResponse(Long id, String code, String name, int priceCents, BillingInterval billingInterval, boolean isActive) {
    public static PlanResponse from(Plan p) {
        return new PlanResponse(p.getId(), p.getCode(), p.getName(), p.getPriceCents(), p.getBillingInterval(), p.isActive());
    }
}
