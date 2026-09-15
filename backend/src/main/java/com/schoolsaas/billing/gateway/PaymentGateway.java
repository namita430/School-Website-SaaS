package com.schoolsaas.billing.gateway;

import com.schoolsaas.superadmin.plan.Plan;

/**
 * Payment processor abstraction, deliberately Stripe-shaped so a real
 * implementation is a drop-in swap for {@link StubPaymentGateway} - same
 * pattern as StorageService (Phase 9) and the SSL-provisioning boundary
 * (Phase 11): build the real integration surface now, defer the actual
 * external dependency until real credentials exist (see this phase's
 * discussion with the user - no Stripe test keys are available in this
 * environment).
 *
 * A real implementation would call Stripe's Checkout Session API here and
 * verify webhook signatures in handleWebhookEvent; StubPaymentGateway does
 * neither - it never touches the network at all.
 */
public interface PaymentGateway {

    /** Starts a checkout for the given school subscribing to the given plan. */
    CheckoutResult createCheckoutSession(Long schoolId, Plan plan);

    record CheckoutResult(
            String sessionId,
            boolean succeededImmediately,
            String redirectUrl,
            String externalCustomerId,
            String externalSubscriptionId
    ) {
    }
}
