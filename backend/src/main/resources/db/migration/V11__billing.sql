-- Global plan catalog - Super Admin managed, not tenant-owned (same shape
-- as roles/permissions/components: a shared platform-wide list schools
-- pick from, not something each school creates its own copy of).
CREATE TABLE plans (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    code                VARCHAR(50)   NOT NULL,
    name                VARCHAR(150)  NOT NULL,
    price_cents         INT           NOT NULL,
    billing_interval    VARCHAR(20)   NOT NULL, -- MONTHLY | YEARLY
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_plans_code UNIQUE (code)
) ENGINE=InnoDB;

-- One subscription per school (like themes/seo_settings), pointing at a
-- plan. A school has no row here until it first subscribes - "no
-- subscription yet" is a meaningful state, unlike Theme/SeoSettings which
-- auto-create sensible defaults on first read.
CREATE TABLE subscriptions (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id               BIGINT      NOT NULL,
    plan_id                 BIGINT      NOT NULL,
    status                  VARCHAR(20) NOT NULL, -- TRIALING | ACTIVE | PAST_DUE | CANCELED
    current_period_end      TIMESTAMP   NULL,
    stripe_customer_id      VARCHAR(255) NULL,
    stripe_subscription_id  VARCHAR(255) NULL,
    created_at              TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_subscriptions_school_id UNIQUE (school_id),
    CONSTRAINT fk_subscriptions_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Many payments per school over time (unlike subscriptions, not unique per school).
CREATE TABLE payments (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    school_id                   BIGINT      NOT NULL,
    subscription_id             BIGINT      NULL,
    amount_cents                INT         NOT NULL,
    currency                    VARCHAR(10) NOT NULL DEFAULT 'usd',
    status                       VARCHAR(20) NOT NULL, -- PENDING | SUCCEEDED | FAILED
    stripe_payment_intent_id    VARCHAR(255) NULL,
    created_at                  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_subscriptions_school_id ON subscriptions(school_id);
CREATE INDEX idx_payments_school_id ON payments(school_id);

-- Billing management permission - restricted to SCHOOL_OWNER only (not
-- SCHOOL_ADMIN/CONTENT_MANAGER), since this is more sensitive than typical
-- content/settings management. SUPER_ADMIN manages the global plan catalog
-- via the existing PLATFORM_MANAGE permission (seeded in V1) - no new
-- permission needed for that side.
INSERT INTO permissions (code, description) VALUES
    ('BILLING_MANAGE', 'View and manage the school''s subscription and billing');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('SUPER_ADMIN', 'SCHOOL_OWNER')
  AND p.code = 'BILLING_MANAGE';

-- Seed a couple of baseline plans so the billing UI has something to show immediately.
INSERT INTO plans (code, name, price_cents, billing_interval, is_active) VALUES
    ('starter-monthly', 'Starter', 0, 'MONTHLY', TRUE),
    ('pro-monthly', 'Pro', 2900, 'MONTHLY', TRUE),
    ('pro-yearly', 'Pro (annual)', 29000, 'YEARLY', TRUE);
