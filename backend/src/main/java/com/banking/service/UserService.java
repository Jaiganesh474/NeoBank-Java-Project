package com.banking.service;

import com.banking.model.Role;
import com.banking.model.User;
import com.banking.payload.SignUpRequest;
import com.banking.repository.RoleRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.model.Account;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService customAuthService;
    private final com.banking.repository.AccountRepository accountRepository;
    private final com.banking.repository.TransactionRepository transactionRepository;
    private final com.banking.repository.CardRepository cardRepository;

    public User registerUser(SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Email address already in use.");
        }

        // Create user
        User user = new User();
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setEnabled(false); // User must verify OTP first
        user.setAccountLocked(false);

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("User Role not set."));

        // Check if admin role requested
        if ("admin".equalsIgnoreCase(signUpRequest.getInitialRole())) {
            Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin Role not set."));
            user.setRoles(new java.util.HashSet<>(java.util.Arrays.asList(userRole, adminRole)));
        } else {
            user.setRoles(Collections.singleton(userRole));
        }

        User savedUser = userRepository.save(user);

        // Generate and send OTP for registration
        customAuthService.generateForgotPasswordOtp(user.getEmail()); // Reuse OTP generation logic

        return savedUser;
    }

    public void verifyRegistration(String email, String otp) {
        // We reuse the OTP verification logic but specifically for enabling a user
        customAuthService.verifyRegistrationOtp(email, otp);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);
    }

    public User registerFirebaseUser(com.google.firebase.auth.FirebaseToken token) {
        User user = new User();

        String name = token.getName();
        if (name != null && !name.trim().isEmpty()) {
            String[] parts = name.trim().split("\\s+");
            user.setFirstName(parts[0]);
            if (parts.length > 1) {
                user.setLastName(name.substring(name.indexOf(parts[1])).trim());
            } else {
                user.setLastName("");
            }
        } else {
            user.setFirstName(token.getEmail() != null ? token.getEmail().split("@")[0] : "User");
            user.setLastName("");
        }

        user.setEmail(token.getEmail());
        user.setPassword(""); // No password for Firebase users
        user.setAuthProvider(User.AuthProvider.GOOGLE); // Or add FIREBASE to AuthProvider enum
        user.setProviderId(token.getUid());
        user.setEnabled(true);
        user.setAccountLocked(false);

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("User Role not set."));
        user.setRoles(Collections.singleton(userRole));

        return userRepository.save(user);
    }

    public com.banking.model.User updateUserProfile(Long userId, com.banking.payload.UpdateProfileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Check if this is a Mobile Number Update
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            String cleanPhone = customAuthService.sanitizePhone(request.getPhoneNumber());

            // Critical Check: Integrity check before DB constraint fires
            if (userRepository.existsByPhoneNumber(cleanPhone) && !cleanPhone.equals(user.getPhoneNumber())) {
                throw new RuntimeException("This mobile number is already linked to another user's profile.");
            }

            // Verify OTP sent to NEW mobile number
            customAuthService.verifyPhoneOtp(request.getPhoneNumber(), request.getOtp());
            user.setPhoneNumber(cleanPhone);
            return userRepository.save(user);
        }

        // Standard Profile Update (Name/Email) - Verify OTP sent to CURRENT email
        customAuthService.verifyRegistrationOtp(user.getEmail(), request.getOtp());

        user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            user.setLastName(request.getLastName());

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email address already in use.");
            }
            user.setEmail(request.getEmail());
        }

        return userRepository.save(user);
    }

    public User updateUserAvatar(Long userId, String profileImageUrl) {
        System.out.println("Updating avatar for user: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfileImageUrl(profileImageUrl);
        return userRepository.save(user);
    }

    @Transactional
    public void setTpin(Long userId, String tpin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setTpin(passwordEncoder.encode(tpin));
        user.setTpinSet(true);
        userRepository.save(user);
    }

    @Transactional
    public void changeTpin(Long userId, String oldTpin, String newTpin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getTpinSet()) {
            throw new RuntimeException("TPIN is not set. Please set it first.");
        }

        if (!passwordEncoder.matches(oldTpin, user.getTpin())) {
            throw new RuntimeException("Original Transaction PIN is incorrect.");
        }

        user.setTpin(passwordEncoder.encode(newTpin));
        user.setTpinSet(true);
        userRepository.save(user);
    }

    @Transactional
    public void setLoginPin(Long userId, String pin) {
        if (pin == null || !pin.matches("\\d{4}")) {
            throw new RuntimeException("Login PIN must be exactly 4 digits");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLoginPin(passwordEncoder.encode(pin));
        user.setLoginPinSet(true);
        userRepository.save(user);
    }

    @Transactional
    public void changeLoginPin(Long userId, String oldPin, String newPin) {
        if (newPin == null || !newPin.matches("\\d{4}")) {
            throw new RuntimeException("New Login PIN must be exactly 4 digits");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getLoginPinSet()) {
            throw new RuntimeException("Login PIN is not set. Please set it first.");
        }

        if (!passwordEncoder.matches(oldPin, user.getLoginPin())) {
            throw new RuntimeException("Original Login PIN is incorrect.");
        }

        user.setLoginPin(passwordEncoder.encode(newPin));
        user.setLoginPinSet(true);
        userRepository.save(user);
    }

    @Transactional
    public void resetLoginPin(Long userId, String otp, String newPin) {
        if (newPin == null || !newPin.matches("\\d{4}")) {
            throw new RuntimeException("New Login PIN must be exactly 4 digits");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        verifyUserActionOtp(user, otp);

        user.setLoginPin(passwordEncoder.encode(newPin));
        user.setLoginPinSet(true);
        userRepository.save(user);
    }

    private void verifyUserActionOtp(User user, String otp) {
        // Priority: Profile Phone > Account Phone > Email (matches
        // AuthService.resolvePrimaryContact)
        String phoneNumber = user.getPhoneNumber();

        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            phoneNumber = user.getAccounts().stream().findFirst()
                    .map(com.banking.model.Account::getPhoneNumber)
                    .orElse(null);
        }

        boolean verified = false;

        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            try {
                customAuthService.verifyPhoneOtp(phoneNumber, otp);
                verified = true;
            } catch (Exception e) {
            }
        }

        if (!verified) {
            try {
                customAuthService.verifyRegistrationOtp(user.getEmail(), otp);
                verified = true;
            } catch (Exception e) {
                throw new RuntimeException("Invalid or expired OTP. Please try again.");
            }
        }
    }

    public boolean verifyTpin(Long userId, String tpin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getTpin() != null && passwordEncoder.matches(tpin, user.getTpin());
    }

    public void changePassword(Long userId, com.banking.payload.ChangePasswordRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        customAuthService.verifyRegistrationOtp(user.getEmail(), request.getOtp());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void resetTpin(Long userId, String otp, String newTpin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        verifyUserActionOtp(user, otp);

        user.setTpin(passwordEncoder.encode(newTpin));
        user.setTpinSet(true);
        userRepository.save(user);
    }

    public void deleteUserGlobal(Long userId, String otp) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Try to identify which contact method was used for the OTP
        String phoneNumber = user.getAccounts().stream().findFirst()
                .map(com.banking.model.Account::getPhoneNumber)
                .orElse(user.getPhoneNumber());

        boolean verified = false;

        // 1. Try Mobile Verification if phone exists
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            try {
                customAuthService.verifyPhoneOtp(phoneNumber, otp);
                verified = true;
            } catch (Exception e) {
                // If it fails, maybe it was sent to email? (fallback behavior)
            }
        }

        // 2. Try Email Verification if not verified yet
        if (!verified) {
            try {
                customAuthService.verifyRegistrationOtp(user.getEmail(), otp);
                verified = true;
            } catch (Exception e) {
                // Both failed
                throw new RuntimeException("Invalid or expired OTP. Please try again.");
            }
        }

        // 3. Clear child records for all accounts to satisfy FK constraints
        List<Account> userAccounts = accountRepository.findByUserId(userId);
        for (Account account : userAccounts) {
            transactionRepository.deleteByAccountId(account.getId());
            cardRepository.deleteByAccountId(account.getId());
        }

        // 4. Explicitly clear accounts
        accountRepository.deleteByUserId(userId);

        // 5. Finally delete the user
        userRepository.delete(user);
    }

    public java.util.Map<String, Boolean> getNotificationSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.Map<String, Boolean> settings = new java.util.HashMap<>();
        settings.put("email", user.getEmailNotifications());
        settings.put("sms", user.getSmsNotifications());
        settings.put("push", user.getPushNotifications());
        settings.put("marketing", user.getMarketingNotifications());

        return settings;
    }

    @Transactional
    public void updateNotificationSettings(Long userId, java.util.Map<String, Boolean> settings) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (settings.containsKey("email"))
            user.setEmailNotifications(settings.get("email"));
        if (settings.containsKey("sms"))
            user.setSmsNotifications(settings.get("sms"));
        if (settings.containsKey("push"))
            user.setPushNotifications(settings.get("push"));
        if (settings.containsKey("marketing"))
            user.setMarketingNotifications(settings.get("marketing"));

        userRepository.save(user);
    }
}
