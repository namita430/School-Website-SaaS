package com.schoolsaas.platform.tenant;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Pins Spring's transaction advisor to run at order 0 (outer), so that
 * {@link TenantFilterAspect} - ordered at 1 (inner) - always executes
 * AFTER a transaction (and therefore a bound persistence context) has
 * started. Enabling the Hibernate tenantFilter requires an active Session,
 * which only exists once inside the transaction.
 *
 * Also enables JPA auditing so BaseEntity's @CreatedDate/@LastModifiedDate
 * are actually populated - without @EnableJpaAuditing, AuditingEntityListener
 * is a no-op and every insert fails NOT NULL on created_at/updated_at
 * (caught by actually running this against a live database).
 */
@Configuration
@EnableTransactionManagement(order = 0)
@EnableJpaAuditing
@EnableConfigurationProperties(PublicSiteProperties.class)
public class JpaConfig {
}
