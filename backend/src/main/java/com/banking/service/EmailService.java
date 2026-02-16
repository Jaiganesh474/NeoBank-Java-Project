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
    private String smtpUsername;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.from:eatsureofficial@gmail.com}")
    private String fromEmail;

    // @Async (Temporarily disabled to diagnose connection issues)
    // @Async (Temporarily disabled to diagnose connection issues)
    public void sendDebitNotification(String to, String firstName, String amount, String recipient,
            String transactionId) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(fromEmail, "NeoBank Alerts");
            helper.setSubject("Transaction Alert: Debit [₹" + amount + "]");

            String htmlContent = "<html><body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 20px;'>"
                    +
                    "<div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>"
                    +
                    "<div style='background: #ef4444; padding: 40px; text-align: center;'>" +
                    "<h1 style='color: white; margin: 0; font-size: 28px; font-weight: 800;'>Money Sent</h1>" +
                    "</div>" +
                    "<div style='padding: 40px;'>" +
                    "<p style='color: #64748b; font-size: 16px; margin-top: 0;'>Hi " + firstName + ",</p>" +
                    "<p style='color: #1e293b; font-size: 18px; line-height: 1.6;'>This is to inform you that a debit transaction occurred from your NeoBank account.</p>"
                    +
                    "<div style='background: #f8fafc; border-radius: 16px; padding: 24px; margin: 30px 0; border: 1px solid #e2e8f0;'>"
                    +
                    "<div style='display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #64748b;'><span>Amount</span> <span style='color: #ef4444; font-weight: 700; font-size: 18px;'>-₹"
                    + amount + "</span></div>" +
                    "<div style='display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #64748b;'><span>To</span> <strong style='color: #1e293b;'>"
                    + recipient + "</strong></div>" +
                    "<div style='display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #64748b;'><span>Transaction ID</span> <code style='color: #475569;'>"
                    + transactionId + "</code></div>" +
                    "<div style='display: flex; justify-content: space-between; font-size: 14px; color: #64748b;'><span>Time</span> <span style='color: #1e293b;'>"
                    + java.time.LocalDateTime.now()
                            .format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"))
                    + "</span></div>" +
                    "</div>" +
                    "<p style='color: #64748b; font-size: 14px; line-height: 1.6;'>If this wasn't you, please lock your account immediately from the security settings or contact our support team.</p>"
                    +
                    "<div style='text-align: center; margin-top: 40px;'>" +
                    "<a href='#' style='background: #1e293b; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px;'>Support Center</a>"
                    +
                    "</div>" +
                    "</div>" +
                    "<div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;'>"
                    +
                    "© 2026 NeoBank | Powered by Intelligence. All rights reserved." +
                    "</div>" +
                    "</div>" +
                    "</body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending debit notification: " + e.getMessage());
        }
    }

    // @Async
    public void sendCreditNotification(String to, String firstName, String amount, String sender,
            String transactionId) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(fromEmail, "NeoBank Alerts");
            helper.setSubject("Transaction Alert: Credit [₹" + amount + "]");

            String htmlContent = "<html><body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 20px;'>"
                    +
                    "<div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>"
                    +
                    "<div style='background: #10b981; padding: 40px; text-align: center;'>" +
                    "<h1 style='color: white; margin: 0; font-size: 28px; font-weight: 800;'>Money Received</h1>" +
                    "</div>" +
                    "<div style='padding: 40px;'>" +
                    "<p style='color: #64748b; font-size: 16px; margin-top: 0;'>Hi " + firstName + ",</p>" +
                    "<p style='color: #1e293b; font-size: 18px; line-height: 1.6;'>Great news! You have received a credit to your NeoBank account.</p>"
                    +
                    "<div style='background: #f8fafc; border-radius: 16px; padding: 24px; margin: 30px 0; border: 1px solid #e2e8f0;'>"
                    +
                    "<div style='display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #64748b;'><span>Amount</span> <span style='color: #10b981; font-weight: 700; font-size: 18px;'>+₹"
                    + amount + "</span></div>" +
                    "<div style='display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #64748b;'><span>From</span> <strong style='color: #1e293b;'>"
                    + sender + "</strong></div>" +
                    "<div style='display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #64748b;'><span>Transaction ID</span> <code style='color: #475569;'>"
                    + transactionId + "</code></div>" +
                    "<div style='display: flex; justify-content: space-between; font-size: 14px; color: #64748b;'><span>Time</span> <span style='color: #1e293b;'>"
                    + java.time.LocalDateTime.now()
                            .format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"))
                    + "</span></div>" +
                    "</div>" +
                    "<p style='color: #64748b; font-size: 14px; line-height: 1.6;'>The amount is now available in your balance.</p>"
                    +
                    "<div style='text-align: center; margin-top: 40px;'>" +
                    "<a href='#' style='background: #10b981; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px;'>Go to Dashboard</a>"
                    +
                    "</div>" +
                    "</div>" +
                    "<div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;'>"
                    +
                    "© 2026 NeoBank | Powered by Intelligence. All rights reserved." +
                    "</div>" +
                    "</div>" +
                    "</body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending credit notification: " + e.getMessage());
        }
    }

    public void sendOtpEmail(String to, String otp) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(fromEmail, "NeoBank Security");
            helper.setSubject("Security Code: " + otp);

            String htmlContent = "<html><body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 20px;'>"
                    +
                    "<div style='max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>"
                    +
                    "<div style='background: #3b82f6; padding: 30px; text-align: center;'>" +
                    "<h1 style='color: white; margin: 0; font-size: 24px; font-weight: 800;'>Security Verification</h1>"
                    +
                    "</div>" +
                    "<div style='padding: 40px; text-align: center;'>" +
                    "<p style='color: #64748b; font-size: 16px; margin-top: 0;'>Hello,</p>" +
                    "<p style='color: #1e293b; font-size: 16px; line-height: 1.6;'>Use the verification code below to complete your action. This code is valid for <strong>3 minutes</strong>.</p>"
                    +
                    "<div style='background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; margin: 30px 0;'>"
                    +
                    "<span style='font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b;'>" + otp
                    + "</span>" +
                    "</div>" +
                    "<p style='color: #94a3b8; font-size: 13px; line-height: 1.6;'>If you did not request this code, please ignore this email or contact support if you suspect unauthorized activity.</p>"
                    +
                    "</div>" +
                    "<div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>"
                    +
                    "© 2026 NeoBank | Secure Banking. All rights reserved." +
                    "</div>" +
                    "</div>" +
                    "</body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending OTP email: " + e.getMessage());
            throw new RuntimeException("Email service unavailable.");
        }
    }
}
