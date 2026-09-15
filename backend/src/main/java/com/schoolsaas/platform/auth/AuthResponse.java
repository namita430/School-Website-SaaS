package com.schoolsaas.platform.auth;

import java.util.List;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        Long userId,
        String email,
        String fullName,
        Long activeSchoolId,
        List<SchoolMembershipDto> memberships,
        List<String> globalRoles
) {
}
