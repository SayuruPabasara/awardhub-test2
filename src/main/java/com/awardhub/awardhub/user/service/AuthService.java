package com.awardhub.awardhub.user.service;

import com.awardhub.awardhub.common.exception.*;
import com.awardhub.awardhub.security.dto.*;
import com.awardhub.awardhub.security.jwt.JwtUtil;
import com.awardhub.awardhub.security.otp.OtpService;
import com.awardhub.awardhub.user.entity.*;
import com.awardhub.awardhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication service — handles registration (with OTP), login (JWT), and token refresh.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    /**
     * Register a new user. Account starts as PENDING_VERIFICATION.
     * An OTP is sent to verify the email before activation.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Create the appropriate subtype entity based on role
        User user = createUserByRole(request);
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setContactNumber(request.getContactNumber());
        user.setAccountStatus(AccountStatus.PENDING_VERIFICATION);

        userRepository.save(user);

        // Send OTP for email verification
        otpService.generateAndSend(request.getEmail());

        return AuthResponse.builder()
                .email(user.getEmail())
                .role(request.getRole().name())
                .userId(user.getUserID())
                .message("Registration successful. Please verify your email with the OTP sent.")
                .build();
    }

    /**
     * Verify OTP and activate account.
     */
    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        boolean valid = otpService.verify(request.getEmail(), request.getOtp());
        if (!valid) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        // Issue tokens upon successful verification
        String accessToken = jwtUtil.generateAccessToken(
                user.getEmail(), user.getRole().name(), user.getUserID());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getUserID())
                .message("Email verified successfully")
                .build();
    }

    /**
     * Login with email + password. Issues JWT access + refresh tokens.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (user.getAccountStatus() == AccountStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Please verify your email before logging in");
        }

        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new BadRequestException("Your account has been suspended");
        }

        String accessToken = jwtUtil.generateAccessToken(
                user.getEmail(), user.getRole().name(), user.getUserID());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getUserID())
                .message("Login successful")
                .build();
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtUtil.extractEmail(refreshToken);

        if (jwtUtil.isTokenExpired(refreshToken)) {
            throw new BadRequestException("Refresh token has expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String newAccessToken = jwtUtil.generateAccessToken(
                user.getEmail(), user.getRole().name(), user.getUserID());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getUserID())
                .build();
    }

    /**
     * Resend OTP to a pending user.
     */
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.getAccountStatus() != AccountStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Account is already verified");
        }

        otpService.generateAndSend(email);
    }

    /**
     * Factory method: creates the correct User subtype based on the selected role.
     */
    private User createUserByRole(RegisterRequest request) {
        return switch (request.getRole()) {
            case NOMINEE -> {
                Nominee nominee = new Nominee();
                nominee.setNicPassport(request.getNicPassport());
                yield nominee;
            }
            case VOTER -> {
                Voter voter = new Voter();
                voter.setNic(request.getNic());
                voter.setActivationStatus(false);
                yield voter;
            }
            case JUDGE -> {
                Judge judge = new Judge();
                judge.setAreaOfExpertise(request.getAreaOfExpertise());
                yield judge;
            }
            case AWARD_ORGANIZER -> {
                AwardOrganizer organizer = new AwardOrganizer();
                organizer.setPosition(request.getPosition());
                yield organizer;
            }
            case SYSTEM_ADMINISTRATOR -> {
                SystemAdministrator admin = new SystemAdministrator();
                admin.setAccessLevel(request.getAccessLevel());
                yield admin;
            }
        };
    }
}
