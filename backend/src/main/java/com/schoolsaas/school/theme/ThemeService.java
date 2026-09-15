package com.schoolsaas.school.theme;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.schoolsaas.platform.audit.AuditLogService;
import com.schoolsaas.platform.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * No token validation is performed here - unlike PageContentValidator, a
 * theme is just a flat bag of named values with no component-schema
 * concept to check against. An unrecognized or malformed token is harmless:
 * the renderer applies "var(--x, fallback)" everywhere, so a bad/missing
 * value just falls back to the default rather than breaking anything.
 */
@Service
public class ThemeService {

    private final ThemeRepository themeRepository;
    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;

    public ThemeService(ThemeRepository themeRepository, ObjectMapper objectMapper, AuditLogService auditLogService) {
        this.themeRepository = themeRepository;
        this.objectMapper = objectMapper;
        this.auditLogService = auditLogService;
    }

    /** Creates a default-tokens row on first access - a school always has a theme once asked for one. */
    @Transactional
    public Theme getOrCreateForCurrentSchool() {
        return themeRepository.findAll().stream().findFirst().orElseGet(() -> {
            Theme theme = new Theme();
            theme.setTokensJson(defaultTokens());
            return themeRepository.save(theme);
        });
    }

    @Transactional
    public Theme update(UpdateThemeRequest request) {
        Theme theme = getOrCreateForCurrentSchool();
        theme.setTokensJson(request.tokens());
        theme = themeRepository.save(theme);
        auditLogService.record("THEME_UPDATED", "Theme", theme.getId(), TenantContext.getCurrentSchoolId(), Map.of());
        return theme;
    }

    /** The 8 tokens from architecture principle #10, with sensible defaults matching the existing Tailwind config fallbacks. */
    private JsonNode defaultTokens() {
        ObjectNode tokens = objectMapper.createObjectNode();
        tokens.put("colorPrimary", "#2563eb");
        tokens.put("colorSecondary", "#1e293b");
        tokens.put("colorAccent", "#f59e0b");
        tokens.put("colorBackground", "#ffffff");
        tokens.put("colorText", "#111827");
        tokens.put("fontHeading", "Inter, sans-serif");
        tokens.put("fontBody", "Inter, sans-serif");
        tokens.put("radius", "0.5rem");
        return tokens;
    }
}
