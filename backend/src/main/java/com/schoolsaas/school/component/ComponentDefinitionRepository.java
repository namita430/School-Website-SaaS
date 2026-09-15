package com.schoolsaas.school.component;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ComponentDefinitionRepository extends JpaRepository<ComponentDefinition, Long> {
    Optional<ComponentDefinition> findByTypeKey(String typeKey);
}
