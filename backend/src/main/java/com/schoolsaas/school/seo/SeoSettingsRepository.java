package com.schoolsaas.school.seo;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * No custom derived-query methods here on purpose - see ThemeRepository's
 * Javadoc for why (two derived-query bugs earlier in this project). At most
 * one row per tenant exists anyway (unique constraint on school_id).
 */
public interface SeoSettingsRepository extends JpaRepository<SeoSettings, Long> {
}
