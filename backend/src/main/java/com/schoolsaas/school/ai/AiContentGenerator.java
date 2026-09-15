package com.schoolsaas.school.ai;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * Generates a starter site (pages + theme suggestion) from a few
 * school-provided inputs, per architecture section 27's "AI Website
 * Generator" - deliberately abstracted behind this interface, same pattern
 * as PaymentGateway (Phase 12) and StorageService (Phase 9): the user has
 * no LLM API key available in this environment, so {@link StubAiGenerator}
 * is the only implementation - it builds real, valid page content
 * (using the existing component registry, so PageContentValidator accepts
 * it with no special-casing) from template logic, not from a network call.
 * A real Claude/GPT-backed implementation later is a new @Service class
 * implementing this interface; AiSiteGenerationService and the controller
 * above it need no changes.
 */
public interface AiContentGenerator {

    GeneratedSite generate(GenerationInput input);

    record GenerationInput(String schoolName, String schoolType, String location, String style, String primaryColor) {
    }

    record GeneratedPage(String slug, String title, JsonNode contentJson) {
    }

    record GeneratedSite(List<GeneratedPage> pages, JsonNode themeTokens) {
    }
}
