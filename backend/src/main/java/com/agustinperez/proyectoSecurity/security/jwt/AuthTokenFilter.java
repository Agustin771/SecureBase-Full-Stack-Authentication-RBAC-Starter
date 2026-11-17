package com.agustinperez.proyectoSecurity.security.jwt;

import com.agustinperez.proyectoSecurity.security.RestAuthenticationEntryPoint;
import com.agustinperez.proyectoSecurity.security.services.UserDetailsServiceimpl;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.util.Set;

import java.io.IOException;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(AuthTokenFilter.class);

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceimpl userDetailsService;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;

    public AuthTokenFilter(
            JwtUtils jwtUtils,
            UserDetailsServiceimpl userDetailsService,
            RestAuthenticationEntryPoint authenticationEntryPoint
    ) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    private static final Set<String> PUBLIC_ENDPOINTS = Set.of(
            "/auth/csrf",
            "/auth/login",
            "/auth/register",
            "/auth/verify",
            "/auth/resend-verification",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/refresh",
            "/auth/logout"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return PUBLIC_ENDPOINTS.contains(request.getServletPath());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String jwt = parseJwt(request);

        // Si no hay JWT, continúa como usuario anónimo.
        if (!StringUtils.hasText(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (!jwtUtils.validateJwtToken(jwt)) {
                throw new BadCredentialsException(
                        "JWT inválido o expirado"
                );
            }

            String username =
                    jwtUtils.getUserNameFromJwtToken(jwt);

            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(username);

            if (!userDetails.isEnabled()) {
                throw new DisabledException(
                        "La cuenta no está habilitada"
                );
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

        } catch (JwtException | AuthenticationException exception) {

            SecurityContextHolder.clearContext();

            log.warn(
                    "JWT rechazado | method={} | uri={} | reason={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    exception.getClass().getSimpleName()
            );

            authenticationEntryPoint.commence(
                    request,
                    response,
                    exception instanceof AuthenticationException
                            ? (AuthenticationException) exception
                            : new BadCredentialsException(
                            "Token inválido",
                            exception
                    )
            );

            return;
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {

        String headerAuth =
                request.getHeader(HttpHeaders.AUTHORIZATION);

        if (StringUtils.hasText(headerAuth)
                && headerAuth.startsWith("Bearer ")) {

            return headerAuth.substring(7);
        }

        return null;
    }
}
