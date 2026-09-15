package com.schoolsaas.school.component;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only catalog for the builder frontend to introspect what component
 * types exist and what props each one accepts. Any authenticated school
 * member with website visibility can read it - it's a shared, global
 * catalog, not tenant data.
 */
@RestController
@RequestMapping("/api/v1/components")
@PreAuthorize("authentication.principal.schoolId != null and hasAuthority('PERM_WEBSITE_VIEW')")
public class ComponentDefinitionController {

    private final ComponentDefinitionRepository componentDefinitionRepository;

    public ComponentDefinitionController(ComponentDefinitionRepository componentDefinitionRepository) {
        this.componentDefinitionRepository = componentDefinitionRepository;
    }

    @GetMapping
    public List<ComponentDefinitionResponse> list() {
        return componentDefinitionRepository.findAll().stream()
                .map(ComponentDefinitionResponse::from)
                .toList();
    }
}
