package com.schoolsaas.billing.subscription;

import com.schoolsaas.billing.gateway.PaymentGateway;
import com.schoolsaas.billing.payment.Payment;
import com.schoolsaas.billing.payment.PaymentRepository;
import com.schoolsaas.billing.payment.PaymentStatus;
import com.schoolsaas.platform.audit.AuditLogService;
import com.schoolsaas.platform.common.BadRequestException;
import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.platform.tenant.TenantContext;
import com.schoolsaas.superadmin.plan.Plan;
import com.schoolsaas.superadmin.plan.PlanService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Orchestrates plan selection, the PaymentGateway checkout, and recording
 * the resulting Subscription/Payment rows. Deliberately does NOT
 * auto-create a Subscription on read (unlike Theme/SeoSettings's
 * getOrCreate pattern) - "no subscription yet" is a real, valid state a
 * school can be in, not something to default away.
 */
@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final PlanService planService;
    private final PaymentGateway paymentGateway;
    private final AuditLogService auditLogService;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, PaymentRepository paymentRepository,
                                PlanService planService, PaymentGateway paymentGateway, AuditLogService auditLogService) {
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.planService = planService;
        this.paymentGateway = paymentGateway;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Optional<Subscription> getCurrent() {
        return subscriptionRepository.findAll().stream().findFirst();
    }

    @Transactional(readOnly = true)
    public List<Payment> listPayments() {
        return (List<Payment>) paymentRepository.findAllNewestFirst();
    }

    /**
     * Subscribes (or switches plan) for the current school. Uses
     * PaymentGateway.createCheckoutSession - with the stub implementation
     * that always succeeds immediately, this activates the subscription and
     * records a SUCCEEDED payment synchronously; a real gateway would
     * instead return a redirect URL and the actual activation would happen
     * asynchronously via a webhook (not wired up, since there is no real
     * gateway to send one - see PaymentGateway's Javadoc).
     */
    @Transactional
    public Subscription subscribe(Long planId, Long schoolId) {
        Plan plan = planService.getById(planId);
        if (!plan.isActive()) {
            throw new BadRequestException("This plan is no longer available");
        }

        PaymentGateway.CheckoutResult checkout = paymentGateway.createCheckoutSession(schoolId, plan);

        Subscription subscription = subscriptionRepository.findAll().stream().findFirst()
                .orElseGet(Subscription::new);
        subscription.setPlan(plan);
        subscription.setStripeCustomerId(checkout.externalCustomerId());
        subscription.setStripeSubscriptionId(checkout.externalSubscriptionId());

        if (checkout.succeededImmediately()) {
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setCurrentPeriodEnd(nextPeriodEnd(plan.getBillingInterval()));
        } else {
            subscription.setStatus(SubscriptionStatus.TRIALING);
        }
        subscription = subscriptionRepository.save(subscription);

        Payment payment = new Payment();
        payment.setSubscriptionId(subscription.getId());
        payment.setAmountCents(plan.getPriceCents());
        payment.setStatus(checkout.succeededImmediately() ? PaymentStatus.SUCCEEDED : PaymentStatus.PENDING);
        paymentRepository.save(payment);

        auditLogService.record("SUBSCRIPTION_CHANGED", "Subscription", subscription.getId(), schoolId,
                Map.of("planCode", plan.getCode(), "status", subscription.getStatus().name()));

        return subscription;
    }

    @Transactional
    public Subscription cancel() {
        Subscription subscription = subscriptionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new NotFoundException("No active subscription to cancel"));
        subscription.setStatus(SubscriptionStatus.CANCELED);
        subscription = subscriptionRepository.save(subscription);
        auditLogService.record("SUBSCRIPTION_CANCELED", "Subscription", subscription.getId(),
                TenantContext.getCurrentSchoolId(), Map.of("planCode", subscription.getPlan().getCode()));
        return subscription;
    }

    private static Instant nextPeriodEnd(com.schoolsaas.superadmin.plan.BillingInterval interval) {
        Instant now = Instant.now();
        return interval == com.schoolsaas.superadmin.plan.BillingInterval.YEARLY
                ? now.plus(365, ChronoUnit.DAYS)
                : now.plus(30, ChronoUnit.DAYS);
    }
}
