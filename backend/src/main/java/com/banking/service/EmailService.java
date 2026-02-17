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

    @Async
    public void sendDebitNotification(String to, String firstName, String amount, String recipient,
            String transactionId, String userAcc, String partnerAcc, String balance) {
        System.out.println("SMTP: Preparing debit notification for " + to);
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, false, "UTF-8");

            String maskedUser = maskAccountNumber(userAcc);
            String maskedPartner = maskAccountNumber(partnerAcc);

            helper.setTo(to);
            helper.setFrom(fromEmail, "NeoBank Alerts");
            helper.setSubject("Debit Alert: from NeoBank (A/c:" + maskedUser + ")");

            String time = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Kolkata"))
                    .format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) + " IST";

            String htmlContent = "<html><body style='font-family: -apple-system, sans-serif; background-color: #f1f5f9; padding: 20px; margin: 0;'>"
                    +
                    "<div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>"
                    +
                    "<div style='background: #ef4444; padding: 30px 20px; text-align: center;'>" +
                    "<h1 style='color: white; margin: 0; font-size: 22px; font-weight: 800; line-height: 1.4;'>Amount Debited from A/c "
                    + maskedUser + "</h1>" +
                    "</div>" +
                    "<div style='padding: 30px 20px;'>" +
                    "<p style='color: #64748b; font-size: 16px; margin-top: 0;'>Dear " + firstName + ",</p>" +
                    "<p style='color: #1e293b; font-size: 15px; line-height: 1.6;'>Your NeoBank account <strong>"
                    + maskedUser + "</strong> has been <strong>debited</strong> for ₹" + amount + " for a transfer to "
                    + recipient
                    + ".</p>"
                    +
                    "<div style='background: #f8fafc; border-radius: 16px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;'>"
                    +
                    "<table width='100%' cellpadding='0' cellspacing='0' style='border-collapse: collapse;'>" +
                    "<tr><td style='padding: 8px 0; font-size: 14px; color: #64748b;'>Amount</td><td align='right' style='padding: 8px 0; color: #ef4444; font-weight: 700; font-size: 18px;'>₹"
                    + amount + "</td></tr>" +
                    "<tr><td style='padding: 8px 0; font-size: 14px; color: #64748b; vertical-align: top;'>To</td><td align='right' style='padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;'>"
                    + recipient + "<br><span style='font-weight: 400; color: #64748b; font-size: 12px;'>("
                    + maskedPartner + ")</span></td></tr>" +
                    "<tr><td style='padding: 8px 0; font-size: 14px; color: #64748b;'>Balance</td><td align='right' style='padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 15px;'>₹"
                    + balance + "</td></tr>" +
                    "<tr><td colspan='2' style='padding: 15px 0 5px 0; border-top: 1px solid #edf2f7; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;'>Transaction ID</td></tr>"
                    +
                    "<tr><td colspan='2' style='padding: 0 0 10px 0; font-family: monospace; font-size: 12px; color: #475569; word-break: break-all;'>"
                    + transactionId + "</td></tr>" +
                    "<tr><td style='padding: 8px 0; font-size: 14px; color: #64748b;'>Date</td><td align='right' style='padding: 8px 0; color: #1e293b; font-size: 13px;'>"
                    + time + "</td></tr>" +
                    "</table>" +
                    "</div>" +
                    "<p style='color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;'>If this transaction was not authorized by you, please block your account immediately.</p>"
                    +
                    "<div style='text-align: center; margin-top: 30px;'>" +
                    "<a href='https://neobank-v8jw.onrender.com/' style='background: #1e293b; color: white; padding: 12px 25px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;'>Support Center</a>"
                    +
                    "</div>" +
                    "</div>" +
                    "<div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>"
                    +
                    "© 2026 NeoBank | Security First. All rights reserved." +
                    "</div>" +
                    "</div>" +
                    "</body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("SMTP: Debit notification successfully delivered to relay for " + to);
        } catch (Exception e) {
            System.err.println("SMTP ERROR: Failed to send debit notification to " + to + ": " + e.getMessage());
        }
    }

    @Async
    public void sendCreditNotification(String to, String firstName, String amount, String sender,
            String transactionId, String userAcc, String partnerAcc, String balance) {
        System.out.println("SMTP: Preparing credit notification for " + to);
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, false, "UTF-8");

            String maskedUser = maskAccountNumber(userAcc);
            String maskedPartner = maskAccountNumber(partnerAcc);
            helper.setTo(to);
            helper.setFrom(fromEmail, "NeoBank Alerts");
            helper.setSubject("Credit Alert: from NeoBank (A/c:" + maskedUser + ")");

            String time = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Kolkata"))
                    .format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) + " IST";

            String htmlContent = "<html><body style='font-family: -apple-system, sans-serif; background-color: #f1f5f9; padding: 20px; margin: 0;'>"
                    +
                    "<div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>"
                    +
                    "<div style='background: #10b981; padding: 30px 20px; text-align: center;'>" +
                    "<h1 style='color: white; margin: 0; font-size: 22px; font-weight: 800; line-height: 1.4;'>Amount Credited to A/c "
                    + maskedUser + "</h1>" +
                    "</div>" +
                    "<div style='padding: 30px 20px;'>" +
                    "<p style='color: #64748b; font-size: 16px; margin-top: 0;'>Hi " + firstName + ",</p>" +
                    "<p style='color: #1e293b; font-size: 15px; line-height: 1.6;'>Great news! Your NeoBank account <strong>"
                    + maskedUser + "</strong> has been <strong>credited</strong> with ₹" + amount + " from " + sender
                    + ".</p>"
                    +
                    "<div style='background: #f8fafc; border-radius: 16px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;'>"
                    +
                    "<table width='100%' cellpadding='0' cellspacing='0' style='border-collapse: collapse;'>" +
                    "<tr><td style='padding: 8px 0; font-size: 14px; color: #64748b;'>Amount</td><td align='right' style='padding: 8px 0; color: #10b981; font-weight: 700; font-size: 18px;'>₹"
                    + amount + "</td></tr>" +
                    "<tr><td style='padding: 8px 0; font-size: 14px; color: #64748b; vertical-align: top;'>From</td><td align='right' style='padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;'>"
                    + sender + "<br><span style='font-weight: 400; color: #64748b; font-size: 12px;'>(" + maskedPartner
                    + ")</span></td></tr>" +
                    "<tr><td style='padding: 8px 0; font-size: 14px; color: #64748b;'>Balance</td><td align='right' style='padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 15px;'>₹"
                    + balance + "</td></tr>" +
                    "<tr><td colspan='2' style='padding: 15px 0 5px 0; border-top: 1px solid #edf2f7; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;'>Transaction ID</td></tr>"
                    +
                    "<tr><td colspan='2' style='padding: 0 0 10px 0; font-family: monospace; font-size: 12px; color: #475569; word-break: break-all;'>"
                    + transactionId + "</td></tr>" +
                    "<tr><td style='padding: 8px 0; font-size: 14px; color: #64748b;'>Date</td><td align='right' style='padding: 8px 0; color: #1e293b; font-size: 13px;'>"
                    + time + "</td></tr>" +
                    "</table>" +
                    "</div>" +
                    "<p style='color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;'>The amount is now reflected in your total available balance.</p>"
                    +
                    "<div style='text-align: center; margin-top: 30px;'>" +
                    "<a href='https://neobank-v8jw.onrender.com/dashboard' style='background: #10b981; color: white; padding: 12px 25px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;'>Go to Dashboard</a>"
                    +
                    "</div>" +
                    "</div>" +
                    "<div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>"
                    +
                    "© 2026 NeoBank | Security First. All rights reserved." +
                    "</div>" +
                    "</div>" +
                    "</body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("SMTP: Credit notification successfully delivered to relay for " + to);
        } catch (Exception e) {
            System.err.println("SMTP ERROR: Failed to send credit notification to " + to + ": " + e.getMessage());
        }
    }

    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4)
            return "****";
        return "XXXX" + accountNumber.substring(accountNumber.length() - 4);
    }

    public void sendOtpEmail(String to, String otp) {
        sendSecurityEmail(to, "Security Verification", "Verification Code", otp,
                "If you did not request this code, please ignore this email.");
    }

    public void sendRegistrationOtpEmail(String to, String firstName, String otp) {
        String greeting = (firstName != null && !firstName.isEmpty()) ? "Welcome, " + firstName + "!"
                : "Welcome to NeoBank!";
        sendSecurityEmail(to, "Welcome to NeoBank", greeting, otp,
                "Use the code below to verify your email and activate your account.");
    }

    public void sendForgotPasswordOtpEmail(String to, String otp) {
        sendSecurityEmail(to, "Reset Your Password", "Password Reset Request", otp,
                "We received a request to reset your password. Use the code below to proceed.");
    }

    public void sendPasswordUpdatedNotification(String to, String firstName) {
        System.out.println("SMTP: Preparing password update alert for " + to);
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, false, "UTF-8");

            helper.setTo(to);
            helper.setFrom(fromEmail, "NeoBank Security");
            helper.setSubject("Security Alert: Password Updated");

            String htmlContent = "<html><body style='font-family: -apple-system, sans-serif; background-color: #f1f5f9; padding: 20px;'>"
                    +
                    "<div style='max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>"
                    +
                    "<div style='background: #1e293b; padding: 30px; text-align: center;'>" +
                    "<h1 style='color: white; margin: 0; font-size: 24px; font-weight: 800;'>Security Update</h1>" +
                    "</div>" +
                    "<div style='padding: 40px; text-align: center;'>" +
                    "<div style='width: 60px; height: 60px; background: #fef3c7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;'>"
                    +
                    "<span style='font-size: 30px;'>🔒</span>" +
                    "</div>" +
                    "<p style='color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 0;'>Password Successfully Changed</p>"
                    +
                    "<p style='color: #64748b; font-size: 15px; line-height: 1.6;'>Hi "
                    + (firstName != null ? firstName : "there")
                    + ",<br><br>The password for your NeoBank account was recently updated. If you made this change, you can safely ignore this email.</p>"
                    +
                    "<div style='background: #fdf2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 15px; margin: 25px 0;'>"
                    +
                    "<p style='color: #b91c1c; font-size: 13px; margin: 0;'><strong>Did not make this change?</strong><br>If you suspect unauthorized access, please lock your account immediately or contact support.</p>"
                    +
                    "</div>" +
                    "<a href='#' style='background: #3b82f6; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; margin-top: 10px;'>Contact Support</a>"
                    +
                    "</div>" +
                    "<div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>"
                    +
                    "© 2026 NeoBank | All Rights Reserved" +
                    "</div>" +
                    "</div></body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("SMTP: Password updated alert successfully delivered to relay for " + to);
        } catch (Exception e) {
            System.err.println("SMTP ERROR: Failed to send password update alert: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendSecurityEmail(String to, String subject, String title, String code, String description) {
        System.out.println("SMTP: Preparing security email (" + subject + ") for " + to);
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, false, "UTF-8");

            helper.setTo(to);
            helper.setFrom(fromEmail, "NeoBank Security");
            helper.setSubject(subject + "To your NeoBank Online Banking App");

            String htmlContent = "<html><body style='font-family: -apple-system, sans-serif; background-color: #f1f5f9; padding: 20px;'>"
                    +
                    "<div style='max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>"
                    +
                    "<div style='background: #3b82f6; padding: 30px; text-align: center;'>" +
                    "<h1 style='color: white; margin: 0; font-size: 24px; font-weight: 800;'>" + title + "</h1>" +
                    "</div>" +
                    "<div style='padding: 40px; text-align: center;'>" +
                    "<p style='color: #475569; font-size: 16px; line-height: 1.6;'>" + description + "</p>" +
                    "<div style='background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 25px; margin: 30px 0;'>"
                    +
                    "<span style='font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #1e293b;'>" + code
                    + "</span>" +
                    "</div>" +
                    "<p style='color: #94a3b8; font-size: 13px;'>This code is valid for <strong>5 minutes</strong>. For your security, never share this code with anyone.</p>"
                    +
                    "</div>" +
                    "<div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>"
                    +
                    "© 2026 NeoBank | Powered by Security Intelligence" +
                    "</div>" +
                    "</div></body></html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("SMTP: Security email (" + subject + ") successfully delivered to relay for " + to);
        } catch (Exception e) {
            System.err.println("SMTP ERROR: Failed to send security email (" + subject + "): " + e.getMessage());
            e.printStackTrace();
        }
    }
}
