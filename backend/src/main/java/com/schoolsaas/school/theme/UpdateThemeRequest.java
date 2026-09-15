package com.schoolsaas.school.theme;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

public record UpdateThemeRequest(@NotNull JsonNode tokens) {
}
