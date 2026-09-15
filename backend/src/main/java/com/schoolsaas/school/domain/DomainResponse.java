package com.schoolsaas.school.domain;

import java.time.Instant;

public record DomainResponse(
        Long id,
        String domain,
        DomainType type,
        VerificationStatus verificationStatus,
        SslStatus sslStatus,
        boolean isPrimary,
        String txtRecordName,
        String txtRecordValue,
        String cnameTarget,
        Instant createdAt,
        Instant updatedAt
) {
    /** cnameTarget: every custom domain CNAMEs to the SAME platform ingress hostname - the reverse proxy routes by Host header, not by DNS target. */
    static DomainResponse from(Domain d, String txtRecordName, String cnameTarget) {
        return new DomainResponse(
                d.getId(), d.getDomain(), d.getType(), d.getVerificationStatus(), d.getSslStatus(), d.isPrimary(),
                txtRecordName, d.getVerificationToken(), cnameTarget, d.getCreatedAt(), d.getUpdatedAt()
        );
    }
}
