package com.banking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String senderEmail;

    // @Async (Temporarily disabled to diagnose connection issues)
    public void sendOtpEmail(String to, String otp) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(senderEmail, "NeoBank");
            helper.setSubject("NeoBank | Verify Your Identity");

            String htmlContent = "<html><body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px;'>"
                    +
                    "<div style='max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>"
                    +
                    "<h1 style='color: #2563eb; margin-bottom: 20px; text-align: center;'>NeoBank</h1>" +
                    "<p style='color: #4b5563; font-size: 16px; text-align: center; line-height: 1.6;'>You requested a security code. Please use the following One-Time Password to proceed:</p>"
                    +
                    "<div style='background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;'>"
                    +
                    "<span style='font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #1e293b;'>" + otp
                    + "</span>" +
                    "</div>" +
                    "<p style='color: #94a3b8; font-size: 14px; text-align: center;'>This code will expire in 3 minutes for your security. If you didn't request this, please ignore this email.</p>"
                    +
                    "</div>" +
                    "</body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            throw new RuntimeException(
                    "Email service is currently unavailable. Please try again later. Details: " + e.getMessage());
        }
    }
}
