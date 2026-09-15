package com.schoolsaas.billing.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

/** No custom derived-query methods - see ThemeRepository's Javadoc. At most one row per tenant (unique school_id). */
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
}
