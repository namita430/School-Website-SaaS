package com.schoolsaas.superadmin.plan;

import com.schoolsaas.platform.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Global plan catalog, Super Admin managed - not tenant-owned. Schools pick
 * from this shared list (see billing.subscription.Subscription), the same
 * relationship components/roles/permissions have to the schools that use
 * them.
 */
@Getter
@Setter
@Entity
@Table(name = "plans")
public class Plan extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "price_cents", nullable = false)
    private int priceCents;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_interval", nullable = false)
    private BillingInterval billingInterval;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    /** Template IDs a school may use when it is assigned this plan. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_templates", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "template_id", nullable = false)
    private Set<String> templateIds = new LinkedHashSet<>();
}
