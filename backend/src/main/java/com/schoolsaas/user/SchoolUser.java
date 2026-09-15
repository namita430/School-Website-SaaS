package com.schoolsaas.user;

import com.schoolsaas.platform.common.TenantOwnedEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

/**
 * A user's membership + role within one specific school. This is where a
 * SCHOOL-scoped {@link Role} is actually granted to a user; the school_id
 * inherited from {@link TenantOwnedEntity} is what the row belongs to.
 */
@Getter
@Setter
@Entity
@Table(name = "school_users", uniqueConstraints = @UniqueConstraint(columnNames = {"school_id", "user_id"}))
public class SchoolUser extends TenantOwnedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
}
