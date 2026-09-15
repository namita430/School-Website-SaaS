package com.schoolsaas.platform.security;

import com.schoolsaas.platform.tenant.TenantContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Validates the {@code Authorization: Bearer <token>} header (when present)
 * and, on success, populates both the Spring Security context AND
 * {@link TenantContext} from the token's {@code schoolId} claim - this is
 * the admin-API half of tenant resolution described on
 * {@link com.schoolsaas.platform.tenant.TenantResolutionFilter}.
 *
 * A missing or invalid token is not itself rejected here; it simply leaves
 * the request unauthenticated, letting Spring Security's authorization
 * rules (see {@link SecurityConfig}) decide whether the endpoint requires
 * authentication.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            Optional<Claims> claims = jwtService.parseAndValidate(token);
            if (claims.isPresent()) {
                Claims c = claims.get();
                Long userId = Long.valueOf(c.getSubject());
                String email = JwtService.emailFrom(c);
                Long schoolId = JwtService.schoolIdFrom(c);
                List<String> authorityCodes = JwtService.authoritiesFrom(c);

                List<GrantedAuthority> authorities = authorityCodes == null
                        ? List.of()
                        : authorityCodes.stream().<GrantedAuthority>map(SimpleGrantedAuthority::new).toList();

                AppUserPrincipal principal = new AppUserPrincipal(userId, email, schoolId);
                var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                if (schoolId != null) {
                    TenantContext.setCurrentSchoolId(schoolId);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
