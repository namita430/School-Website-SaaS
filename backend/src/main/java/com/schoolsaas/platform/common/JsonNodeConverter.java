package com.schoolsaas.platform.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Maps a JPA entity field of type {@link JsonNode} to/from a MySQL JSON
 * column, stored as text. Reused by every entity that persists structured
 * JSON directly (component schemas, page content) rather than modeling it
 * as normalized rows - see architecture principle #9 (JSON page
 * representation) and #8 (schema-driven component registry).
 */
@Converter
public class JsonNodeConverter implements AttributeConverter<JsonNode, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(JsonNode attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize JSON attribute", e);
        }
    }

    @Override
    public JsonNode convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return MAPPER.readTree(dbData);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse JSON column value", e);
        }
    }
}
