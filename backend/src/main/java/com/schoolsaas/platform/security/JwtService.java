package com.schoolsaas.platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;

/**
 * Issues and validates short-lived JWT access tokens. Refresh tokens are a
 * separate concern (see {@link com.schoolsaas.platform.auth.AuthService}):
 * they are opaque random values, hashed and stored server-side so they can
 * be individually revoked - a JWT itself cannot be revoked before it
 * expires, which is why the access token TTL is kept short (default 15 min).
 */
@Service
public class JwtService {

    private static final String CLAIM_SCHOOL_ID = "schoolId";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_AUTHORITIES = "authorities";

    private final SecretKey signingKey;
    private final JwtProperties properties;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        // Accept either a raw passphrase or a Base64-encoded key; pad/hash
        // short dev secrets so HS256's 256-bit key requirement is always met.
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(properties.getSecret());
        } catch (IllegalArgumentException notBase64) {
            keyBytes = properties.getSecret().getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            keyBytes = sha256(properties.getSecret());
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(Long userId, String email, Long schoolId, List<String> authorities) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim(CLAIM_EMAIL, email)
                .claim(CLAIM_SCHOOL_ID, schoolId)
                .claim(CLAIM_AUTHORITIES, authorities)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(properties.getAccessTokenTtlMinutes() * 60)))
                .signWith(signingKey)
                .compact();
    }

    public long getAccessTokenTtlSeconds() {
        return properties.getAccessTokenTtlMinutes() * 60;
    }

    public long getRefreshTokenTtlSeconds() {
        return properties.getRefreshTokenTtlDays() * 24 * 60 * 60;
    }

    /**
     * @return the parsed claims, or empty if the token is missing, malformed,
     *         expired, or has an invalid signature. Callers should treat any
     *         empty result as "unauthenticated" without distinguishing why.
     */
    public java.util.Optional<Claims> parseAndValidate(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return java.util.Optional.of(claims);
        } catch (JwtException | IllegalArgumentException e) {
            return java.util.Optional.empty();
        }
    }

    public static Long schoolIdFrom(Claims claims) {
        Number schoolId = claims.get(CLAIM_SCHOOL_ID, Number.class);
        return schoolId == null ? null : schoolId.longValue();
    }

    public static String emailFrom(Claims claims) {
        return claims.get(CLAIM_EMAIL, String.class);
    }

    @SuppressWarnings("unchecked")
    public static List<String> authoritiesFrom(Claims claims) {
        return (List<String>) claims.get(CLAIM_AUTHORITIES, List.class);
    }

    /** Hashes an opaque refresh token for at-rest storage/lookup. */
    public static String hashRefreshToken(String rawToken) {
        return Base64.getEncoder().encodeToString(sha256(rawToken));
    }

    private static byte[] sha256(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
