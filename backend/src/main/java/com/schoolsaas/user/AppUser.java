package com.schoolsaas.user;

import com.schoolsaas.platform.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * A platform user account. Named AppUser (not User) to avoid clashing with
 * Spring Security's own {@code org.springframework.security.core.userdetails.User}.
 * A user is global — not tenant-owned — and gains access to one or more
 * schools via {@link SchoolUser} membership rows, or platform-wide access
 * via {@link UserGlobalRole} (e.g. SUPER_ADMIN).
 */
@Getter
@Setter
@Entity
@Table(name = "users")
public class AppUser extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;
}
