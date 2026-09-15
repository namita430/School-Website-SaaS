package com.schoolsaas.school.seo;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * NOT readOnly anywhere here, deliberately - getOrCreateForCurrentSchool()
 * can INSERT a default row on first access, and nesting that inside a
 * readOnly=true transaction breaks against MySQL (Connection.setReadOnly(true)
 * is enforced server-side by Connector/J). This bit PublicSiteService twice
 * already (Phase 6's page-version lookup path, Phase 7's ThemeService) -
 * see those Javadocs. Any caller of getOrCreateForCurrentSchool() must
 * itself not be readOnly, all the way up the call chain.
 */
@Service
public class SeoSettingsService {

    private final SeoSettingsRepository seoSettingsRepository;

    public SeoSettingsService(SeoSettingsRepository seoSettingsRepository) {
        this.seoSettingsRepository = seoSettingsRepository;
    }

    @Transactional
    public SeoSettings getOrCreateForCurrentSchool() {
        return seoSettingsRepository.findAll().stream().findFirst().orElseGet(() -> {
            SeoSettings settings = new SeoSettings();
            settings.setRobotsIndexable(true);
            return seoSettingsRepository.save(settings);
        });
    }

    @Transactional
    public SeoSettings update(UpdateSeoSettingsRequest request) {
        SeoSettings settings = getOrCreateForCurrentSchool();
        settings.setDefaultMetaDescription(request.defaultMetaDescription());
        settings.setDefaultOgImageUrl(request.defaultOgImageUrl());
        settings.setFaviconUrl(request.faviconUrl());
        settings.setRobotsIndexable(request.robotsIndexable());
        return seoSettingsRepository.save(settings);
    }
}
