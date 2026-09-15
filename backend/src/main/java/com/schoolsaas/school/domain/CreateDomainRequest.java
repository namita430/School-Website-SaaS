package com.schoolsaas.school.domain;

import jakarta.validation.constraints.NotBlank;

public record CreateDomainRequest(@NotBlank String domain) {
}
