package com.schoolsaas.platform.auth;

import com.schoolsaas.platform.security.JwtService;
import com.schoolsaas.user.AppUser;
import com.schoolsaas.user.AppUserRepository;
import com.schoolsaas.user.Permission;
import com.schoolsaas.user.RefreshToken;
import com.schoolsaas.user.RefreshTokenRepository;
import com.schoolsaas.user.Role;
import com.schoolsaas.user.SchoolUser;
import com.schoolsaas.user.SchoolUserRepository;
import com.schoolsaas.user.UserGlobalRole;
import com.schoolsaas.user.UserGlobalRoleRepository;
import com.schoolsaas.user.UserStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Handles login/refresh/logout. Deliberately NOT built on Spring Security's
 * AuthenticationManager/UserDetailsService machinery - with roles being
 * per-school memberships rather than a fixed set of authorities on the
 * user, a manual credential check plus explicit membership lookup is
 * simpler and equally secure for this shape of authorization.
 */
@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AppUserRepository appUserRepository;
    private final SchoolUserRepository schoolUserRepository;
    private final UserGlobalRoleRepository userGlobalRoleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository appUserRepository,
                        SchoolUserRepository schoolUserRepository,
                        UserGlobalRoleRepository userGlobalRoleRepository,
                        RefreshTokenRepository refreshTokenRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.schoolUserRepository = schoolUserRepository;
        this.userGlobalRoleRepository = userGlobalRoleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public IssuedAuth login(String email, String rawPassword) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadCredentialsException("Invalid email or password");
        }
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return issueTokensFor(user);
    }

    @Transactional
    public IssuedAuth refresh(String rawRefreshToken) {
        String hash = JwtService.hashRefreshToken(rawRefreshToken);
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash)
                .filter(rt -> !rt.isRevoked())
                .filter(rt -> rt.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token"));

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        AppUser user = appUserRepository.findById(existing.getUserId())
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token"));

        return issueTokensFor(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        String hash = JwtService.hashRefreshToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    private IssuedAuth issueTokensFor(AppUser user) {
        List<SchoolUser> memberships = schoolUserRepository.findByUserId(user.getId());
        List<UserGlobalRole> globalRoles = userGlobalRoleRepository.findByUserId(user.getId());

        // A user active in exactly one school is auto-scoped to it; a user
        // in zero or several schools (or a pure super admin) gets no
        // schoolId claim and must be given a school-selection step by the
        // client before calling school-scoped endpoints - not yet built.
        Long activeSchoolId = memberships.size() == 1 ? memberships.get(0).getSchoolId() : null;

        Set<String> authorities = new LinkedHashSet<>();
        for (UserGlobalRole gr : globalRoles) {
            collectAuthoritiesForRole(gr.getRole(), authorities);
        }
        for (SchoolUser su : memberships) {
            collectAuthoritiesForRole(su.getRole(), authorities);
        }

        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), activeSchoolId, List.copyOf(authorities));

        String rawRefreshToken = generateOpaqueToken();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(user.getId());
        refreshToken.setTokenHash(JwtService.hashRefreshToken(rawRefreshToken));
        refreshToken.setExpiresAt(Instant.now().plusSeconds(jwtService.getRefreshTokenTtlSeconds()));
        refreshTokenRepository.save(refreshToken);

        List<SchoolMembershipDto> membershipDtos = memberships.stream()
                .map(su -> new SchoolMembershipDto(su.getSchoolId(), null, su.getRole().getCode()))
                .toList();
        List<String> globalRoleCodes = globalRoles.stream().map(gr -> gr.getRole().getCode()).toList();

        AuthResponse response = new AuthResponse(
                accessToken,
                "Bearer",
                jwtService.getAccessTokenTtlSeconds(),
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                activeSchoolId,
                membershipDtos,
                globalRoleCodes
        );

        return new IssuedAuth(response, rawRefreshToken, jwtService.getRefreshTokenTtlSeconds());
    }

    private static void collectAuthoritiesForRole(Role role, Set<String> authorities) {
        authorities.add("ROLE_" + role.getCode());
        for (Permission permission : role.getPermissions()) {
            authorities.add("PERM_" + permission.getCode());
        }
    }

    private static String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public record IssuedAuth(AuthResponse response, String rawRefreshToken, long refreshTokenTtlSeconds) {
    }
}
