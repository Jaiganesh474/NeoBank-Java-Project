package com.banking.controller;

import com.banking.model.User;
import com.banking.payload.ApiResponse;
import com.banking.payload.JwtAuthenticationResponse;
import com.banking.payload.LoginRequest;
import com.banking.payload.SignUpRequest;
import com.banking.repository.UserRepository;
import com.banking.security.JwtTokenProvider;
import com.banking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.banking.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final UserService userService;
        private final com.banking.service.AuthService customAuthService;
        private final JwtTokenProvider tokenProvider;
        private final PasswordEncoder passwordEncoder;

        @PostMapping("/signin")
        public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.getEmail(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                String jwt = tokenProvider.generateToken(authentication);
                String refreshToken = tokenProvider.generateRefreshToken(authentication);

                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                List<String> roles = userPrincipal.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

                // Update Last Login
                User user = userRepository.findById(userPrincipal.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String lastLoginStr = user.getLastLogin() != null ? user.getLastLogin().toString() : null;

                user.setLastLogin(java.time.LocalDateTime.now());
                userRepository.save(user);

                return ResponseEntity.ok(new JwtAuthenticationResponse(jwt, refreshToken,
                                userPrincipal.getId(),
                                userPrincipal.getEmail(),
                                userPrincipal.getFirstName(),
                                roles,
                                lastLoginStr,
                                user.getPhoneNumber(),
                                user.getProfileImageUrl(),
                                user.getTpinSet(),
                                user.getLoginPinSet()));
        }

        @PostMapping("/signin-pin")
        public ResponseEntity<?> authenticateUserWithPin(@RequestBody Map<String, String> request) {
                String identifier = request.get("identifier");
                String pin = request.get("pin");

                User user = userRepository.findByPhoneNumber(identifier)
                                .or(() -> userRepository.findByEmail(identifier))
                                .orElseThrow(() -> new RuntimeException("Account not found with: " + identifier));

                if (!user.getLoginPinSet()) {
                        throw new RuntimeException(
                                        "Login PIN is not set for this account. Please sign in using your Password or Google account first.");
                }

                if (!passwordEncoder.matches(pin, user.getLoginPin())) {
                        throw new RuntimeException("Invalid Secure PIN. Please try again.");
                }

                // Manually authenticate
                UserPrincipal userPrincipal = UserPrincipal.create(user);
                Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null,
                                userPrincipal.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);

                String jwt = tokenProvider.generateToken(authentication);
                String refreshToken = tokenProvider.generateRefreshToken(authentication);

                List<String> roles = userPrincipal.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

                String lastLoginStr = user.getLastLogin() != null ? user.getLastLogin().toString() : null;
                user.setLastLogin(java.time.LocalDateTime.now());
                userRepository.save(user);

                return ResponseEntity.ok(new JwtAuthenticationResponse(jwt, refreshToken,
                                userPrincipal.getId(),
                                userPrincipal.getEmail(),
                                userPrincipal.getFirstName(),
                                roles,
                                lastLoginStr,
                                user.getPhoneNumber(),
                                user.getProfileImageUrl(),
                                user.getTpinSet(),
                                user.getLoginPinSet()));
        }

        @PostMapping("/login-otp")
        public ResponseEntity<?> requestLoginOtp(@RequestBody Map<String, String> request) {
                try {
                        String phoneNumber = request.get("phoneNumber");
                        customAuthService.generateLoginOtp(phoneNumber);
                        return ResponseEntity.ok(new ApiResponse(true, "OTP sent to your mobile."));
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(false, e.getMessage()));
                }
        }

        @PostMapping("/signin-otp")
        public ResponseEntity<?> authenticateUserWithOtp(@RequestBody Map<String, String> request) {
                try {
                        String phoneNumber = request.get("phoneNumber");
                        String otp = request.get("otp");

                        User user = customAuthService.loginByOtp(phoneNumber, otp);

                        // Manually authenticate
                        UserPrincipal userPrincipal = UserPrincipal.create(user);
                        Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null,
                                        userPrincipal.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        String jwt = tokenProvider.generateToken(authentication);
                        String refreshToken = tokenProvider.generateRefreshToken(authentication);

                        List<String> roles = userPrincipal.getAuthorities().stream()
                                        .map(GrantedAuthority::getAuthority)
                                        .collect(Collectors.toList());

                        String lastLoginStr = user.getLastLogin() != null ? user.getLastLogin().toString() : null;
                        user.setLastLogin(java.time.LocalDateTime.now());
                        userRepository.save(user);

                        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt, refreshToken,
                                        userPrincipal.getId(),
                                        userPrincipal.getEmail(),
                                        userPrincipal.getFirstName(),
                                        roles,
                                        lastLoginStr,
                                        user.getPhoneNumber(),
                                        user.getProfileImageUrl(),
                                        user.getTpinSet(),
                                        user.getLoginPinSet()));
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(false, e.getMessage()));
                }
        }

        // ... (verifyRegistration, signup methods skipped, they don't use

        @PostMapping("/verify-registration")
        public ResponseEntity<?> verifyRegistration(
                        @Valid @RequestBody com.banking.payload.VerifyRegistrationRequest request) {
                try {
                        userService.verifyRegistration(request.getEmail(), request.getOtp());
                        return ResponseEntity
                                        .ok(new ApiResponse(true, "Account verified successfully. You can now login."));
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(false, e.getMessage()));
                }
        }

        @PostMapping("/signup")
        public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
                if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                        return new ResponseEntity<>(new ApiResponse(false, "Email Address already in use!"),
                                        HttpStatus.BAD_REQUEST);
                }

                User result = userService.registerUser(signUpRequest);

                URI location = ServletUriComponentsBuilder
                                .fromCurrentContextPath().path("/api/users/{username}")
                                .buildAndExpand(result.getEmail()).toUri();

                return ResponseEntity.created(location).body(new ApiResponse(true, "User registered successfully"));
        }

        @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
                if (userPrincipal == null) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(new ApiResponse(false, "User not authenticated"));
                }
                List<String> roles = userPrincipal.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

                User user = userRepository.findById(userPrincipal.getId())
                                .orElse(null);
                String lastLoginStr = (user != null && user.getLastLogin() != null) ? user.getLastLogin().toString()
                                : null;

                return ResponseEntity.ok(new JwtAuthenticationResponse(null, null,
                                userPrincipal.getId(),
                                userPrincipal.getEmail(),
                                userPrincipal.getFirstName(),
                                roles,
                                lastLoginStr,
                                (user != null) ? user.getPhoneNumber() : null,
                                (user != null) ? user.getProfileImageUrl() : null,
                                (user != null) ? user.getTpinSet() : false,
                                (user != null) ? user.getLoginPinSet() : false));
        }

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(@Valid @RequestBody com.banking.payload.ForgotPasswordRequest request) {
                try {
                        customAuthService.generateForgotPasswordOtp(request.getEmail());
                        return ResponseEntity.ok(new ApiResponse(true, "OTP sent to your email."));
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(false, e.getMessage()));
                }
        }

        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@Valid @RequestBody com.banking.payload.ResetPasswordRequest request) {
                try {
                        customAuthService.verifyOtpAndResetPassword(request.getEmail(), request.getOtp(),
                                        request.getNewPassword());
                        return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully."));
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(false, e.getMessage()));
                }
        }

        @PostMapping("/forgot-pin")
        public ResponseEntity<?> forgotPin(@Valid @RequestBody com.banking.payload.ForgotPinRequest request) {
                try {
                        String maskedPhone = customAuthService.generateForgotPinOtp(request.getIdentifier());
                        return ResponseEntity.ok(new ApiResponse(true,
                                        "OTP sent to your registered mobile number: " + maskedPhone));
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(false, e.getMessage()));
                }
        }

        @PostMapping("/reset-pin")
        public ResponseEntity<?> resetPin(@Valid @RequestBody com.banking.payload.ResetPinRequest request) {
                try {
                        customAuthService.verifyOtpAndResetPin(request.getIdentifier(), request.getOtp(),
                                        request.getNewPin());
                        return ResponseEntity.ok(new ApiResponse(true, "Login PIN updated successfully."));
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(false, e.getMessage()));
                }
        }

        @PostMapping("/resend-otp")
        public ResponseEntity<?> resendOtp(@Valid @RequestBody com.banking.payload.ForgotPasswordRequest request) {
                try {
                        customAuthService.resendVerificationOtp(request.getEmail());
                        return ResponseEntity.ok(new ApiResponse(true, "New OTP sent to your email."));
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(false, e.getMessage()));
                }
        }
}
