package com.schoolsaas.school.domain;

/**
 * NONE until DNS verification succeeds, then PROVISIONING - which is where
 * this implementation stops honestly. Actually issuing a certificate
 * (Let's Encrypt/ACME via a reverse proxy that terminates the custom
 * domain) is real infrastructure this dev environment cannot run (no
 * Docker, no public-facing proxy) - ACTIVE is intentionally never set by
 * application code. A production deployment's proxy/ACME integration would
 * be what flips PROVISIONING -> ACTIVE.
 */
public enum SslStatus {
    NONE,
    PROVISIONING,
    ACTIVE
}
