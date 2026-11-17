package com.agustinperez.proyectoSecurity.service;

import com.agustinperez.proyectoSecurity.dto.AuthTokens;
import com.agustinperez.proyectoSecurity.dto.LoginRequest;
import com.agustinperez.proyectoSecurity.dto.RegisterRequest;
import com.agustinperez.proyectoSecurity.exception.AccountNotVerifiedException;
import com.agustinperez.proyectoSecurity.exception.BusinessException;
import com.agustinperez.proyectoSecurity.exception.InvalidTokenException;
import com.agustinperez.proyectoSecurity.exception.VerificationCooldownException;
import com.agustinperez.proyectoSecurity.model.Role;
import com.agustinperez.proyectoSecurity.model.User;
import com.agustinperez.proyectoSecurity.repository.RoleRepository;
import com.agustinperez.proyectoSecurity.repository.UserRepository;

import com.agustinperez.proyectoSecurity.security.jwt.JwtUtils;
import com.agustinperez.proyectoSecurity.model.ERole;

import com.agustinperez.proyectoSecurity.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private static final Logger log =
            LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int MAX_VERIFICATION_ATTEMPTS = 5;
    private static final int MAX_RESET_ATTEMPTS = 5;
    private static final int CODE_EXPIRATION_MINUTES = 15;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RoleRepository roleRepository,
            EmailService emailService,
            RefreshTokenService refreshTokenService) {

        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.emailService = emailService;
        this.refreshTokenService = refreshTokenService;

        log.info("AuthService initialized");
    }

    @Transactional
    public AuthTokens login(LoginRequest request) {

        log.info("LOGIN: iniciando autenticación");

        String normalizedEmail = request.getEmail()
                .trim()
                .toLowerCase(java.util.Locale.ROOT);

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException(
                        "Email o contraseña incorrectos"
                ));

        if (!user.isEnabled()) {
            throw new AccountNotVerifiedException(
                    "ACCOUNT_NOT_VERIFIED"
            );
        }

        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail,
                        request.getPassword()
                )
        );

        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(userDetails);

        String refreshToken = refreshTokenService.createRefreshToken(user);

        log.info("LOGIN: autenticación exitosa");

        return new AuthTokens(jwt, refreshToken);
    }




    @Transactional
    public User register(RegisterRequest request) {

        log.debug("Pedido de registro");

        String normalizedEmail = request.getEmail()
                .trim()
                .toLowerCase(java.util.Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("User registration rejected | reason=email already registered");

            throw new IllegalArgumentException(
                    "Ya existe una cuenta registrada con ese email"
            );
        }

        Role userRole = roleRepository.findByNameRole(ERole.ROLE_USER)
                .orElseThrow(() -> {
                    log.error("User registration failed | reason=ROLE_USER not found");

                    return new IllegalStateException(
                            "No se encontró el rol ROLE_USER"
                    );
                });

        String verificationCode = generateRandomCode();

        LocalDateTime now = LocalDateTime.now();

        User user = new User();

        user.setName(request.getName());
        user.setLastName(request.getLastName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(new HashSet<>(Set.of(userRole)));

        user.setVerificationCodeHash(
                passwordEncoder.encode(verificationCode)
        );

        user.setVerificationCodeExpiresAt(
                now.plusMinutes(CODE_EXPIRATION_MINUTES)
        );

        user.setVerificationAttempts(0);
        user.setVerificationLastSentAt(now);
        user.setEnabled(false);

        userRepository.save(user);

        emailService.sendVerificationEmail(
                user.getEmail(),
                verificationCode
        );

        return user;
    }

    @Transactional
    public void logout(String rawToken) {
        refreshTokenService.logout(rawToken);
    }

    @Transactional
    public AuthTokens refreshToken(String rawRefreshToken) {

        RefreshTokenRotation rotation =
                refreshTokenService.rotateRefreshToken(rawRefreshToken);

        User user = rotation.user();

        if (!user.isEnabled()) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        String newJwt = jwtUtils.generateJwtToken(userDetails);

        return new AuthTokens(newJwt, rotation.rawToken());
    }


    @Transactional(noRollbackFor = InvalidTokenException.class)
    public boolean verifyAccount(String email, String code) {

         User user = userRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        if (user.isEnabled()) {
            throw new BusinessException("La cuenta ya está verificada");
        }

        if (user.getVerificationCodeHash() == null ||
                user.getVerificationCodeExpiresAt() == null) {
            throw new BusinessException("No hay ninguna verificación pendiente.");
        }

        if (!user.getVerificationCodeExpiresAt().isAfter(LocalDateTime.now())) {
            throw new InvalidTokenException("El código de verificación ha caducado");
        }

        if (user.getVerificationAttempts() >= MAX_VERIFICATION_ATTEMPTS) {
            throw new BusinessException(
                    "Superaste el máximo de intentos. Solicitá un nuevo código."
            );
        }

        if (!passwordEncoder.matches(code, user.getVerificationCodeHash())) {

            user.setVerificationAttempts(user.getVerificationAttempts() + 1);

            if (user.getVerificationAttempts() >= MAX_VERIFICATION_ATTEMPTS) {
                user.setVerificationCodeHash(null);
                user.setVerificationCodeExpiresAt(null);
            }

            userRepository.save(user);

            throw new InvalidTokenException("Código de verificación no válido");
        }

        user.setEnabled(true);
        user.setVerificationCodeHash(null);
        user.setVerificationCodeExpiresAt(null);
        user.setVerificationAttempts(0);

        userRepository.save(user);

        return true;
    }


    @Transactional
    public void resendVerificationCode(String email) {

        User user = userRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new BusinessException(
                        "No se pudo procesar la solicitud"
                ));

        if (user.isEnabled()) {
            throw new BusinessException(
                    "La cuenta ya se encuentra verificada"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (user.getVerificationLastSentAt() != null) {

            LocalDateTime nextAllowed =
                    user.getVerificationLastSentAt()
                            .plusSeconds(RESEND_COOLDOWN_SECONDS);

            if (nextAllowed.isAfter(now)) {

                int remainingSeconds = (int) Math.ceil(
                        java.time.Duration.between(now, nextAllowed)
                                .toMillis() / 1000.0
                );

                throw new VerificationCooldownException(
                        remainingSeconds
                );
            }
        }

        String verificationCode = generateRandomCode();

        user.setVerificationCodeHash(
                passwordEncoder.encode(verificationCode)
        );

        user.setVerificationCodeExpiresAt(
                now.plusMinutes(CODE_EXPIRATION_MINUTES)
        );

        user.setVerificationAttempts(0);
        user.setVerificationLastSentAt(now);

        userRepository.save(user);

        emailService.sendVerificationEmail(
                user.getEmail(),
                verificationCode
        );
    }

    @Transactional(readOnly = true)
    public int getVerificationCooldown(String email) {

        return userRepository.findByEmailIgnoreCase(
                        email.trim().toLowerCase(java.util.Locale.ROOT)
                )
                .filter(user -> !user.isEnabled())
                .map(user -> {

                    LocalDateTime lastSent = user.getVerificationLastSentAt();

                    if (lastSent == null) {
                        return 0;
                    }

                    LocalDateTime nextAllowed =
                            lastSent.plusSeconds(RESEND_COOLDOWN_SECONDS);

                    LocalDateTime now = LocalDateTime.now();

                    if (!nextAllowed.isAfter(now)) {
                        return 0;
                    }

                    return (int) Math.ceil(
                            java.time.Duration.between(now, nextAllowed)
                                    .toMillis() / 1000.0
                    );
                })
                .orElse(0);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
    }

    @Transactional
    public void forgotPassword(String email) {

        var optionalUser = userRepository.findByEmailForUpdate(email);

        if (optionalUser.isEmpty()) {
            return;
        }

        User user = optionalUser.get();

        if (!user.isEnabled()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        if (user.getResetPasswordLastRequestedAt() != null &&
                user.getResetPasswordLastRequestedAt()
                        .plusSeconds(RESEND_COOLDOWN_SECONDS)
                        .isAfter(now)) {
            return;
        }

        String resetToken = generateRandomCode();

        user.setResetPasswordTokenHash(
                passwordEncoder.encode(resetToken)
        );

        user.setResetPasswordTokenExpiresAt(
                now.plusMinutes(CODE_EXPIRATION_MINUTES)
        );

        user.setResetPasswordAttempts(0);
        user.setResetPasswordLastRequestedAt(now);

        userRepository.save(user);

        emailService.sendResetPasswordEmail(
                user.getEmail(),
                resetToken
        );
    }



    @Transactional(noRollbackFor = InvalidTokenException.class)
    public void resetPassword(String email, String token, String newPassword) {

        String errorMessage =
                "La solicitud de recuperación no es válida o ha caducado.";

        User user = userRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new InvalidTokenException(errorMessage));

        if (user.getResetPasswordTokenHash() == null ||
                user.getResetPasswordTokenExpiresAt() == null) {
            throw new InvalidTokenException(errorMessage);
        }

        if (!user.getResetPasswordTokenExpiresAt().isAfter(LocalDateTime.now())) {
            throw new InvalidTokenException(errorMessage);
        }

        if (user.getResetPasswordAttempts() >= MAX_RESET_ATTEMPTS) {
            throw new InvalidTokenException(errorMessage);
        }

        if (!passwordEncoder.matches(
                token,
                user.getResetPasswordTokenHash()
        )) {

            user.setResetPasswordAttempts(
                    user.getResetPasswordAttempts() + 1
            );

            if (user.getResetPasswordAttempts() >= MAX_RESET_ATTEMPTS) {
                user.setResetPasswordTokenHash(null);
                user.setResetPasswordTokenExpiresAt(null);
            }

            userRepository.save(user);

            throw new InvalidTokenException(errorMessage);
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        user.setResetPasswordTokenHash(null);
        user.setResetPasswordTokenExpiresAt(null);
        user.setResetPasswordAttempts(0);

        userRepository.save(user);

        refreshTokenService.revokeAllUserTokens(user.getId());
    }

    private String generateRandomCode() {
        int code = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(code);
    }
}