package com.schoolsaas.superadmin.school;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Slug is intentionally not editable here - it is referenced by the
 * subdomain routing scheme (abcschool.yoursaas.com), so changing it is a
 * separate, deliberate operation with its own consequences (broken links,
 * cache invalidation) once the public renderer exists in Phase 6.
 */
public record UpdateSchoolRequest(
        @NotBlank @Size(max = 255) String name
) {
}
