package com.schoolsaas.billing.subscription;

import java.time.Instant;

public record SubscriptionResponse(
        String planCode,
        String planName,
        int priceCents,
        String billingInterval,
        SubscriptionStatus status,
        Instant currentPeriodEnd
) {
    public static SubscriptionResponse from(Subscription s) {
        return new SubscriptionResponse(
                s.getPlan().getCode(), s.getPlan().getName(), s.getPlan().getPriceCents(),
                s.getPlan().getBillingInterval().name(), s.getStatus(), s.getCurrentPeriodEnd()
        );
    }
}
