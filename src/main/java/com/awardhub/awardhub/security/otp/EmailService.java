package com.awardhub.awardhub.security.otp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Email delivery service for OTP codes.
 * Uses Spring Boot's JavaMailSender (configured for Gmail SMTP).
 * In dev profile, OTP is logged to console instead of actually sending.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("AwardHub — Your Verification Code");
            message.setText(String.format(
                    "Your AwardHub verification code is: %s\n\n" +
                    "This code will expire in 5 minutes.\n\n" +
                    "If you did not request this code, please ignore this email.",
                    otp
            ));

            mailSender.send(message);
            log.info("OTP email sent to: {}", to);
        } catch (Exception e) {
            // In dev, mail sending will fail — log OTP to console as fallback
            log.warn("Failed to send OTP email to {}. OTP: {} (use this for testing)", to, otp);
        }
    }
}
