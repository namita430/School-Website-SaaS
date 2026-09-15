package com.schoolsaas.school.component;

import com.fasterxml.jackson.databind.JsonNode;

public record ComponentDefinitionResponse(Long id, String typeKey, String name, JsonNode schemaJson) {
    public static ComponentDefinitionResponse from(ComponentDefinition c) {
        return new ComponentDefinitionResponse(c.getId(), c.getTypeKey(), c.getName(), c.getSchemaJson());
    }
}
