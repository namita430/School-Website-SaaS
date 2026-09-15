package com.schoolsaas.school.theme;

import com.fasterxml.jackson.databind.JsonNode;

public record ThemeResponse(JsonNode tokens) {
    public static ThemeResponse from(Theme theme) {
        return new ThemeResponse(theme.getTokensJson());
    }
}
