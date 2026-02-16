package com.banking.service;

import com.banking.model.OtpToken;
import com.banking.model.User;
import com.banking.repository.OtpTokenRepository;
import com.banking.repository.UserRepository;
import com.banking.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Random;
import org.springframework.beans.factory.annotation.Value;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.banking.security.UserPrincipal;
import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${twilio.account_sid:none}")
    private String twilioAccountSid;

    @Value("${twilio.auth_token:none}")
    private String twilioAuthToken;

    @Value("${twilio.phone_number:none}")
    private String twilioPhoneNumber;

    @PostConstruct
    public void initTwilio() {
        if (!"none".equals(twilioAccountSid) && !"ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX".equals(twilioAccountSid)) {
            try {
                Twilio.init(twilioAccountSid, twilioAuthToken);
                System.out.println("Twilio initialized successfully with Account SID start: "
                        + twilioAccountSid.substring(0, Math.min(twilioAccountSid.length(), 5)));
            } catch (Exception e) {
                System.err.println("Twilio initialization warning: " + e.getMessage());
            }
        }
    }

    @Transactional
    public void generateForgotPasswordOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("User not found with this email");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));

        otpTokenRepository.deleteByEmail(email); // Remove old OTP if exists
        OtpToken otpToken = new OtpToken(email, otp, 3); // 3 minutes expiry
        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmail(email, otp);
    }

    @Transactional
    public void verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        OtpToken otpToken = otpTokenRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found for this email"));

        if (otpToken.isExpired()) {
            otpTokenRepository.delete(otpToken);
            throw new RuntimeException("OTP expired");
        }

        if (!otpToken.getOtp().equals(otp)) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            if (otpToken.getAttempts() >= 3) {
                otpTokenRepository.delete(otpToken);
                throw new RuntimeException("Too many failed attempts. Please request a new OTP.");
            }
            otpTokenRepository.save(otpToken);
            throw new RuntimeException("Invalid OTP");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpTokenRepository.delete(otpToken); // Cleanup after success
    }

    @Transactional
    public void verifyRegistrationOtp(String email, String otp) {
        OtpToken otpToken = otpTokenRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found for this email"));

        if (otpToken.isExpired()) {
            otpTokenRepository.delete(otpToken);
            throw new RuntimeException("OTP expired");
        }

        if (!otpToken.getOtp().equals(otp)) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            if (otpToken.getAttempts() >= 3) {
                otpTokenRepository.delete(otpToken);
                throw new RuntimeException("Too many failed attempts. Please request a new OTP.");
            }
            otpTokenRepository.save(otpToken);
            throw new RuntimeException("Invalid OTP");
        }

        otpTokenRepository.delete(otpToken);
    }

    @Transactional(readOnly = true)
    public void verifyOtpOnly(String identifier, String otp, boolean isPhone) {
        String queryId = isPhone ? sanitizePhone(identifier) : identifier;
        OtpToken otpToken = otpTokenRepository.findByEmail(queryId)
                .orElseThrow(() -> new RuntimeException("Verification code not found or expired."));

        if (otpToken.isExpired()) {
            throw new RuntimeException("Verification code has expired. Please request a new one.");
        }

        if (!otpToken.getOtp().equals(otp.trim())) {
            throw new RuntimeException("Invalid verification code. Please check and try again.");
        }
    }

    @Transactional
    public void resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEnabled()) {
            throw new RuntimeException("Account is already verified");
        }

        generateForgotPasswordOtp(email); // Reuse generation logic
    }

    @Transactional
    public String generateActionOtp(UserPrincipal userPrincipal) {
        String identifier = resolvePrimaryContact(userPrincipal);
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        otpTokenRepository.deleteByEmail(identifier);
        OtpToken otpToken = new OtpToken(identifier, otp, 5);
        otpTokenRepository.save(otpToken);

        boolean isPhone = identifier.matches("\\d{10}") || identifier.startsWith("+");

        if (isPhone) {
            System.out.println("DEBUG: Sending Action OTP to Mobile: " + identifier);
            // SEND REAL SMS
            if (!"none".equals(twilioAccountSid) && !twilioAccountSid.startsWith("ACXXX")
                    && !"none".equals(twilioAuthToken)) {
                try {
                    Message.creator(
                            new com.twilio.type.PhoneNumber(formatToInternational(identifier)),
                            new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                            "NeoBank Authorization: Your code is " + otp + ". Do not share this code.")
                            .create();
                    System.out.println("SUCCESS: Twilio SMS sent to " + identifier);
                } catch (Exception e) {
                    System.err.println("CRITICAL: Twilio SMS failed: " + e.getMessage());
                    throw new RuntimeException("Failed to send authorization SMS: " + e.getMessage());
                }
            } else {
                throw new RuntimeException("SMS service is not configured for authorization.");
            }

            // Always log
            System.out.println("\n================================================");
            System.out.println("   NEOBANK SECURITY: ACTION OTP FOR " + identifier);
            System.out.println("   YOUR CODE IS: " + otp);
            System.out.println("================================================\n");

            // WEBSOCKET FALLBACK
            messagingTemplate.convertAndSendToUser(userPrincipal.getEmail(), "/topic/updates",
                    "Security Verification Code: " + otp + " (NeoBank Developer Fallback)");

            return "MOBILE";
        } else {
            System.out.println("DEBUG: Sending Action OTP to Email: " + identifier);

            System.out.println("\n================================================");
            System.out.println("   NEOBANK SECURITY: EMAIL OTP FOR " + identifier);
            System.out.println("   YOUR CODE IS: " + otp);
            System.out.println("================================================\n");

            // SEND REAL EMAIL
            try {
                emailService.sendOtpEmail(identifier, otp);
                System.out.println("SUCCESS: Action OTP email sent to " + identifier);
            } catch (Exception e) {
                System.err.println("CRITICAL: Action OTP email failed: " + e.getMessage());
            }

            // WEBSOCKET FALLBACK
            messagingTemplate.convertAndSendToUser(userPrincipal.getEmail(), "/topic/updates",
                    "Security Verification Code: " + otp + " (NeoBank Developer Fallback)");

            return "EMAIL";
        }
    }

    public String resolvePrimaryContact(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        String phone = (user != null) ? user.getPhoneNumber() : null;

        if (phone == null || phone.trim().isEmpty()) {
            phone = accountRepository.findByUserId(userPrincipal.getId())
                    .stream()
                    .findFirst()
                    .map(com.banking.model.Account::getPhoneNumber)
                    .orElse(null);
        }

        if (phone != null && !phone.trim().isEmpty()) {
            return sanitizePhone(phone);
        }

        return userPrincipal.getEmail();
    }

    @Transactional
    public void verifyActionOtp(UserPrincipal userPrincipal, String otp) {
        String identifier = resolvePrimaryContact(userPrincipal);
        String cleanOtp = otp.trim();

        OtpToken otpToken = otpTokenRepository.findByEmail(identifier)
                .orElseThrow(() -> new RuntimeException("OTP not found or expired. Please request a new one."));

        if (otpToken.isExpired()) {
            otpTokenRepository.delete(otpToken);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!otpToken.getOtp().equals(cleanOtp)) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            if (otpToken.getAttempts() >= 3) {
                otpTokenRepository.delete(otpToken);
                throw new RuntimeException("Invalid OTP. Too many failed attempts. Please request a new one.");
            }
            otpTokenRepository.save(otpToken);
            throw new RuntimeException("Invalid security code. Please try again.");
        }

        otpTokenRepository.delete(otpToken);
    }

    @Transactional
    public void generatePhoneOtp(com.banking.security.UserPrincipal userPrincipal, String phoneNumber) {
        System.out.println("DEBUG: generatePhoneOtp called for: " + phoneNumber);
        String cleanPhone = sanitizePhone(phoneNumber);
        System.out.println("DEBUG: Sanitized phone: " + cleanPhone);

        if (cleanPhone == null || cleanPhone.trim().isEmpty()) {
            throw new RuntimeException("Invalid phone number format. Please provide a valid mobile number.");
        }

        // Integrity Check: Is this number already used by another user profile?
        if (userRepository.existsByPhoneNumber(cleanPhone)) {
            // Check if it's the SAME user (lookup by phone and compare ID)
            // For simplicity, we can just say it's linked if it exists and we're in 'new
            // phone' context.
            // But if current user already has this phone, it's fine.
            User existingOwner = userRepository.findByPhoneNumber(cleanPhone).orElse(null);
            if (existingOwner != null && userPrincipal != null
                    && !existingOwner.getId().equals(userPrincipal.getId())) {
                throw new RuntimeException("This mobile number is already linked to another user's profile.");
            }
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        System.out.println("DEBUG: Generated OTP: " + otp);

        otpTokenRepository.deleteByEmail(cleanPhone); // Reuse email field for identifier
        OtpToken otpToken = new OtpToken(cleanPhone, otp, 5); // 5 minutes expiry for phone
        otpTokenRepository.save(otpToken);

        // SEND REAL SMS IF TWILIO IS CONFIGURED
        if (!"none".equals(twilioAccountSid) && !twilioAccountSid.startsWith("ACXXX")
                && !"none".equals(twilioAuthToken)) {
            try {
                Message.creator(
                        new com.twilio.type.PhoneNumber(formatToInternational(cleanPhone)),
                        new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                        "NeoBank: Your verification code is " + otp
                                + ". Valid for 5 mins. Do not share this code with anyone.")
                        .create();
                System.out.println("SUCCESS: Twilio SMS sent to " + cleanPhone);
            } catch (Exception e) {
                System.err.println("CRITICAL: Twilio SMS failed to send: " + e.getMessage());
                // Rethrow so the frontend knows it failed
                throw new RuntimeException("SMS Sending Failed: " + e.getMessage());
            }
        }

        // Always log for transparency
        System.out.println("\n================================================");
        System.out.println("   NEOBANK SECURITY: MOBILE OTP FOR " + cleanPhone);
        System.out.println("   YOUR CODE IS: " + otp);
        System.out.println("================================================\n");

        // WEBSOCKET FALLBACK: Send to user's personal topic if logged in
        if (userPrincipal != null) {
            messagingTemplate.convertAndSendToUser(userPrincipal.getEmail(), "/topic/updates",
                    "Your Account Opening OTP is: " + otp + " (Developer Fallback)");
        }
    }

    public String sanitizePhone(String phoneNumber) {
        if (phoneNumber == null)
            return "";
        // Remove everything except numbers
        String digits = phoneNumber.replaceAll("[^0-9]", "");

        // Return just the digits (internal requirement: 10 digits)
        return digits;
    }

    public String formatToInternational(String phoneNumber) {
        if (phoneNumber == null)
            return "";
        String digits = phoneNumber.replaceAll("[^0-9]", "");
        if (digits.length() == 10)
            return "+91" + digits;
        return "+" + digits;
    }

    @Transactional
    public void verifyPhoneOtp(String phoneNumber, String otp) {
        String cleanPhone = sanitizePhone(phoneNumber);
        String cleanOtp = otp.trim();

        OtpToken otpToken = otpTokenRepository.findByEmail(cleanPhone)
                .orElseThrow(() -> new RuntimeException("OTP not found for " + cleanPhone));

        if (otpToken.isExpired()) {
            otpTokenRepository.delete(otpToken);
            throw new RuntimeException("OTP expired");
        }

        if (!otpToken.getOtp().equals(cleanOtp)) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            if (otpToken.getAttempts() >= 3) {
                otpTokenRepository.delete(otpToken);
                throw new RuntimeException("Too many failed attempts. Please request a new OTP.");
            }
            otpTokenRepository.save(otpToken);
            throw new RuntimeException("Invalid OTP code. Please check and try again.");
        }

        otpTokenRepository.delete(otpToken);
    }

    @Transactional
    public String generateForgotPinOtp(String identifier) {
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhoneNumber(sanitizePhone(identifier)))
                .orElseThrow(() -> new RuntimeException("Account not found for: " + identifier));

        String phone = user.getPhoneNumber();
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException(
                    "No mobile number linked to this account. Please use 'Forgot Password' or Contact Support to regain access.");
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        String cleanPhone = sanitizePhone(phone);

        otpTokenRepository.deleteByEmail(cleanPhone);
        OtpToken otpToken = new OtpToken(cleanPhone, otp, 5); // 5 mins
        otpTokenRepository.save(otpToken);

        System.out.println("DEBUG: Generated Forgot PIN OTP: " + otp + " for " + cleanPhone);

        if (!"none".equals(twilioAccountSid) && !twilioAccountSid.startsWith("ACXXX")
                && !"none".equals(twilioAuthToken)) {
            try {
                Message.creator(
                        new com.twilio.type.PhoneNumber(formatToInternational(cleanPhone)),
                        new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                        "NeoBank: Your login PIN reset code is " + otp + ". Do not share this code.")
                        .create();
            } catch (Exception e) {
                System.err.println("CRITICAL: Twilio Forgot PIN SMS failed: " + e.getMessage());
                throw new RuntimeException("Failed to send PIN reset SMS: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("SMS service is not configured for PIN recovery.");
        }

        return cleanPhone.length() >= 10 ? "******" + cleanPhone.substring(cleanPhone.length() - 4) : cleanPhone;
    }

    @Transactional
    public void verifyOtpAndResetPin(String identifier, String otp, String newPin) {
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhoneNumber(sanitizePhone(identifier)))
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (newPin == null || !newPin.matches("\\d{4}")) {
            throw new RuntimeException("Login PIN must be exactly 4 digits");
        }

        if (user.getPhoneNumber() == null) {
            throw new RuntimeException("Recovery mobile number not found");
        }

        verifyPhoneOtp(user.getPhoneNumber(), otp);

        user.setLoginPin(passwordEncoder.encode(newPin));
        user.setLoginPinSet(true);
        userRepository.save(user);
    }

    @Transactional
    public void generateLoginOtp(String phoneNumber) {
        String cleanPhone = sanitizePhone(phoneNumber);
        User user = userRepository.findByPhoneNumber(cleanPhone)
                .orElseThrow(() -> new RuntimeException("No account found with this mobile number."));

        if (!user.getEnabled()) {
            throw new RuntimeException("Account is not verified. Please verify your email first.");
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        otpTokenRepository.deleteByEmail(cleanPhone);
        OtpToken otpToken = new OtpToken(cleanPhone, otp, 5); // 5 mins
        otpTokenRepository.save(otpToken);

        System.out.println("DEBUG: Generated Login OTP: " + otp + " for " + cleanPhone);

        if (!"none".equals(twilioAccountSid) && !twilioAccountSid.startsWith("ACXXX")
                && !"none".equals(twilioAuthToken)) {
            try {
                Message.creator(
                        new com.twilio.type.PhoneNumber(formatToInternational(cleanPhone)),
                        new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                        "NeoBank: Your login verification code is " + otp + ". Valid for 5 mins.")
                        .create();
                System.out.println("SUCCESS: Twilio Login SMS sent to " + cleanPhone);
            } catch (Exception e) {
                System.err.println("CRITICAL: Twilio Login SMS failed: " + e.getMessage());
                throw new RuntimeException("Failed to send SMS: " + e.getMessage());
            }
        } else {
            System.out.println("DEBUG: Twilio not configured properly. SID: " + twilioAccountSid);
            throw new RuntimeException("SMS service is not configured on the server.");
        }
    }

    @Transactional
    public User loginByOtp(String phoneNumber, String otp) {
        String cleanPhone = sanitizePhone(phoneNumber);
        verifyPhoneOtp(cleanPhone, otp);

        return userRepository.findByPhoneNumber(cleanPhone)
                .orElseThrow(() -> new RuntimeException("Account not found during login"));
    }
}
