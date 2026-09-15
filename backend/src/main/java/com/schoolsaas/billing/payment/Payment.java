package com.schoolsaas.billing.payment;

import com.schoolsaas.platform.common.TenantOwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** A billing history entry - many per school over time (unlike Subscription, not unique per school). */
@Getter
@Setter
@Entity
@Table(name = "payments")
public class Payment extends TenantOwnedEntity {

    @Column(name = "subscription_id")
    private Long subscriptionId;

    @Column(name = "amount_cents", nullable = false)
    private int amountCents;

    @Column(nullable = false)
    private String currency = "usd";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;
}
