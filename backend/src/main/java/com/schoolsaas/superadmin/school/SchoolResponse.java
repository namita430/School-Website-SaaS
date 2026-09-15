package com.schoolsaas.superadmin.school;

import java.time.Instant;

public record SchoolResponse(
        Long id,
        String name,
        String slug,
        SchoolStatus status,
        Long planId,
        Instant createdAt,
        Instant updatedAt
) {
    public static SchoolResponse from(School school) {
        return new SchoolResponse(
                school.getId(),
                school.getName(),
                school.getSlug(),
                school.getStatus(),
                school.getPlanId(),
                school.getCreatedAt(),
                school.getUpdatedAt()
        );
    }
}
