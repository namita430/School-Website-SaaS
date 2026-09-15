package com.schoolsaas.school.component;

import com.fasterxml.jackson.databind.JsonNode;
import com.schoolsaas.platform.common.BaseEntity;
import com.schoolsaas.platform.common.JsonNodeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * A registered component type (Hero, Text, NoticeBoard, ...) the builder can
 * place into a page section. Named ComponentDefinition rather than
 * "Component" to avoid colliding with java.awt.Component and reading
 * ambiguously next to Spring's @Component annotation.
 *
 * Not tenant-owned: the registry is global today (isGlobal always true).
 * The isGlobal flag is kept for the future case of a school-specific custom
 * component, so that extension doesn't require a schema change later.
 */
@Getter
@Setter
@Entity
@Table(name = "components")
public class ComponentDefinition extends BaseEntity {

    @Column(name = "type_key", nullable = false, unique = true)
    private String typeKey;

    @Column(nullable = false)
    private String name;

    @Convert(converter = JsonNodeConverter.class)
    @Column(name = "schema_json", nullable = false, columnDefinition = "json")
    private JsonNode schemaJson;

    @Column(name = "is_global", nullable = false)
    private boolean isGlobal = true;
}
