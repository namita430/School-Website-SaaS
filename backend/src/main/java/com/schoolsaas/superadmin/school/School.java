package com.schoolsaas.superadmin.school;

import com.schoolsaas.platform.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * A tenant. Every other tenant-owned entity references this by id via
 * {@link com.schoolsaas.platform.common.TenantOwnedEntity#getSchoolId()}.
 * School itself is NOT tenant-owned (there is nothing "above" it to scope by).
 */
@Getter
@Setter
@Entity
@Table(name = "schools")
public class School extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SchoolStatus status = SchoolStatus.ACTIVE;

    @Column(name = "plan_id")
    private Long planId;
}
