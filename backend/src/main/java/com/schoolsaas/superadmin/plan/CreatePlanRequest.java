package com.schoolsaas.superadmin.plan;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePlanRequest(
        @NotBlank String code,
        @NotBlank String name,
        @Min(0) int priceCents,
        @NotNull BillingInterval billingInterval
) {
}
