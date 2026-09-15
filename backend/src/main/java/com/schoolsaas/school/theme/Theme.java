package com.schoolsaas.school.theme;

import com.fasterxml.jackson.databind.JsonNode;
import com.schoolsaas.platform.common.JsonNodeConverter;
import com.schoolsaas.platform.common.TenantOwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * A school's design tokens - exactly one row per school (see V6 migration's
 * unique constraint on school_id). Tokens are a flat JSON object of named
 * values (see ThemeService.defaultTokens()) mapped to CSS custom properties
 * by the public renderer at runtime, per architecture principle #10: no
 * component hardcodes a color, every one references a token via a CSS var.
 */
@Getter
@Setter
@Entity
@Table(name = "themes")
public class Theme extends TenantOwnedEntity {

    @Convert(converter = JsonNodeConverter.class)
    @Column(name = "tokens_json", nullable = false, columnDefinition = "json")
    private JsonNode tokensJson;
}
