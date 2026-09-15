package com.schoolsaas.billing.payment;

import java.time.Instant;

public record PaymentResponse(Long id, int amountCents, String currency, PaymentStatus status, Instant createdAt) {
    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(p.getId(), p.getAmountCents(), p.getCurrency(), p.getStatus(), p.getCreatedAt());
    }
}
