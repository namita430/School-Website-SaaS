package com.schoolsaas.school.page;

import com.fasterxml.jackson.databind.JsonNode;
import com.schoolsaas.platform.common.BadRequestException;
import com.schoolsaas.school.component.ComponentDefinition;
import com.schoolsaas.school.component.ComponentDefinitionRepository;
import org.springframework.stereotype.Component;

import java.util.Iterator;
import java.util.Map;

/**
 * Validates a page's content_json against the component registry before it
 * is ever saved:
 *   - top level must be an object with a "sections" array
 *   - every section needs a string "id" and a "type" that exists in the
 *     component registry
 *   - every section's "props" object is checked against that component's
 *     schema_json: required properties must be present, and present
 *     properties must match the declared JSON type
 *
 * This is intentionally a small, hand-rolled convention rather than full
 * JSON Schema support (no $ref, oneOf, nested object schemas, etc.) - see
 * the schema_json comment in V4__component_registry_and_pages.sql. It is
 * enough to keep a malformed or unknown-component page from ever being
 * saved, which is the actual goal for Phase 4; a stricter/standard
 * validator can replace this later without changing the stored data shape.
 */
@Component
public class PageContentValidator {

    private final ComponentDefinitionRepository componentDefinitionRepository;

    public PageContentValidator(ComponentDefinitionRepository componentDefinitionRepository) {
        this.componentDefinitionRepository = componentDefinitionRepository;
    }

    public void validate(JsonNode content) {
        if (content == null || !content.isObject() || !content.has("sections") || !content.get("sections").isArray()) {
            throw new BadRequestException("Page content must be an object with a \"sections\" array");
        }

        int index = 0;
        for (JsonNode section : content.get("sections")) {
            validateSection(section, index++);
        }
    }

    private void validateSection(JsonNode section, int index) {
        if (!section.isObject() || !section.hasNonNull("id") || !section.hasNonNull("type")) {
            throw new BadRequestException("Section " + index + " must have an \"id\" and a \"type\"");
        }
        String typeKey = section.get("type").asText();
        ComponentDefinition definition = componentDefinitionRepository.findByTypeKey(typeKey)
                .orElseThrow(() -> new BadRequestException(
                        "Section " + index + " references unknown component type \"" + typeKey + "\""));

        JsonNode props = section.has("props") ? section.get("props") : null;
        validateProps(definition, props, index);
    }

    private void validateProps(ComponentDefinition definition, JsonNode props, int sectionIndex) {
        JsonNode propertySchemas = definition.getSchemaJson().path("properties");
        Iterator<Map.Entry<String, JsonNode>> fields = propertySchemas.fields();

        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String propName = entry.getKey();
            JsonNode propSchema = entry.getValue();
            boolean required = propSchema.path("required").asBoolean(false);
            String expectedType = propSchema.path("type").asText(null);

            JsonNode value = props == null ? null : props.get(propName);
            boolean present = value != null && !value.isNull();

            if (required && !present) {
                throw new BadRequestException("Section " + sectionIndex + " (" + definition.getTypeKey()
                        + ") is missing required prop \"" + propName + "\"");
            }
            if (present && expectedType != null && !matchesType(value, expectedType)) {
                throw new BadRequestException("Section " + sectionIndex + " (" + definition.getTypeKey()
                        + ") prop \"" + propName + "\" must be of type " + expectedType);
            }
        }
    }

    private boolean matchesType(JsonNode value, String expectedType) {
        return switch (expectedType) {
            case "string" -> value.isTextual();
            case "number" -> value.isNumber();
            case "boolean" -> value.isBoolean();
            case "array" -> value.isArray();
            case "object" -> value.isObject();
            default -> true; // unknown declared type - don't block on it
        };
    }
}
