package com.schoolsaas.school.domain;

import com.schoolsaas.platform.common.TenantOwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "domains")
public class Domain extends TenantOwnedEntity {

    @Column(nullable = false, unique = true)
    private String domain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DomainType type = DomainType.CUSTOM;

    @Column(name = "verification_token", nullable = false)
    private String verificationToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "ssl_status", nullable = false)
    private SslStatus sslStatus = SslStatus.NONE;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;
}
