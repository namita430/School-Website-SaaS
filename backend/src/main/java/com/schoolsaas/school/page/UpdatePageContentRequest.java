package com.schoolsaas.school.page;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

public record UpdatePageContentRequest(@NotNull JsonNode content) {
}
