package com.awardhub.awardhub.security.otp;

import com.awardhub.awardhub.security.entity.OtpCode;
import com.awardhub.awardhub.security.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * OTP generation and verification service.
 * OTPs are persisted in the database so they survive restarts and work
 * across multiple server instances.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    @Value("${app.otp.expiration}")
    private long otpExpirationMs;

    @Value("${app.otp.length}")
    private int otpLength;

    private final EmailService emailService;
    private final OtpCodeRepository otpCodeRepository;
    private final SecureRandom random = new SecureRandom();

    public void generateAndSend(String email) {
        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now().plusNanos(otpExpirationMs * 1_000_000);

        // Replace any existing OTP for this email
        otpCodeRepository.deleteByEmail(email);
        otpCodeRepository.save(new OtpCode(email, otp, expiry));

        emailService.sendOtpEmail(email, otp);
        log.info("OTP generated for email: {}", email);
    }

    public boolean verify(String email, String otp) {
        Optional<OtpCode> existing = otpCodeRepository.findByEmail(email);
        if (existing.isEmpty()) {
            return false;
        }

        OtpCode entry = existing.get();
        if (LocalDateTime.now().isAfter(entry.getExpiryTime())) {
            otpCodeRepository.delete(entry);
            return false;
        }
        if (entry.getCode().equals(otp)) {
            otpCodeRepository.delete(entry);
            return true;
        }
        return false;
    }

    private String generateOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
