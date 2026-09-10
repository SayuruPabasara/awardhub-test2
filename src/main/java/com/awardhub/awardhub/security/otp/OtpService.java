package com.awardhub.awardhub.security.otp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP generation and verification service.
 * Stores OTPs in-memory with expiry (sufficient for dev/single-instance).
 * In production, swap to Redis or a DB-backed store.
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
    private final SecureRandom random = new SecureRandom();

    // In-memory OTP store: email → {otp, expiryTime}
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public void generateAndSend(String email) {
        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now().plusNanos(otpExpirationMs * 1_000_000);
        otpStore.put(email, new OtpEntry(otp, expiry));

        emailService.sendOtpEmail(email, otp);
        log.info("OTP generated for email: {}", email);
    }

    public boolean verify(String email, String otp) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) {
            return false;
        }
        if (LocalDateTime.now().isAfter(entry.expiry())) {
            otpStore.remove(email);
            return false;
        }
        if (entry.otp().equals(otp)) {
            otpStore.remove(email);
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

    private record OtpEntry(String otp, LocalDateTime expiry) {}
}
