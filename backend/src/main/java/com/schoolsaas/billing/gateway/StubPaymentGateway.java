package com.schoolsaas.billing.gateway;

import com.schoolsaas.superadmin.plan.Plan;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Deterministically simulates a successful checkout - no network call, no
 * external dependency, no Stripe SDK. This is the ONLY PaymentGateway
 * implementation today because no Stripe test keys are available in this
 * environment (a deliberate choice, discussed with the user, not an
 * oversight). Replacing it with a real Stripe-backed implementation means
 * adding a new @Service implementing PaymentGateway (using Stripe's Java
 * SDK - checkout.Session.create, webhook signature verification via
 * Webhook.constructEvent) and making Spring prefer it (e.g. @Primary, or
 * removing this stub) - SubscriptionService and every other caller needs
 * no changes, since they only depend on the interface.
 */
@Service
public class StubPaymentGateway implements PaymentGateway {

    @Override
    public CheckoutResult createCheckoutSession(Long schoolId, Plan plan) {
        String fakeId = "stub_" + UUID.randomUUID();
        return new CheckoutResult(
                fakeId,
                true, // simulated success, no redirect/webhook round-trip needed
                null,
                "stub_cus_" + schoolId,
                "stub_sub_" + fakeId
        );
    }
}
