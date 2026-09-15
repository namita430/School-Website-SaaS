package com.schoolsaas.school.page;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreatePageRequest(
        @NotBlank @Size(max = 255) String title,

        @NotBlank
        @Size(max = 150)
        @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
                message = "slug must be lowercase alphanumeric words separated by hyphens (e.g. about-us)")
        String slug
) {
}
