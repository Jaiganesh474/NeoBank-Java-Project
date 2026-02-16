package com.banking.controller;

import com.banking.payload.ApiResponse;
import com.banking.payload.UpdateProfileRequest;
import com.banking.payload.UpdateAvatarRequest;
import com.banking.payload.ChangePasswordRequest;
import com.banking.payload.TpinRequest;
import com.banking.security.UserPrincipal;
import com.banking.service.UserService;
import com.banking.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final com.banking.service.CloudinaryService cloudinaryService;

    @PostMapping("/avatar/upload")
    public ResponseEntity<?> uploadAvatar(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String fileUrl = cloudinaryService.uploadFile(file);
            userService.updateUserAvatar(userPrincipal.getId(), fileUrl);

            return ResponseEntity.ok(new ApiResponse(true, "Avatar uploaded successfully", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateAvatarRequest request) {
        try {
            userService.updateUserAvatar(userPrincipal.getId(), request.getProfileImageUrl());
            return ResponseEntity.ok(new ApiResponse(true, "Avatar updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<?> removeAvatar(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            userService.updateUserAvatar(userPrincipal.getId(), null);
            return ResponseEntity.ok(new ApiResponse(true, "Avatar removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateProfileRequest request) {
        try {
            userService.updateUserProfile(userPrincipal.getId(), request);
            return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/send-update-otp")
    public ResponseEntity<?> sendUpdateOtp(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            authService.generateForgotPasswordOtp(userPrincipal.getEmail()); // Reuse email OTP logic
            return ResponseEntity.ok(new ApiResponse(true, "OTP sent to your registered email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(userPrincipal.getId(), request);
            return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/send-delete-otp")
    public ResponseEntity<?> sendDeleteOtp(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            String method = authService.generateActionOtp(userPrincipal); // Returns "MOBILE" or "EMAIL"
            String message = "MOBILE".equals(method)
                    ? "OTP sent to your registered mobile number."
                    : "OTP sent to your registered email address.";
            return ResponseEntity.ok(new ApiResponse(true, message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/send-mobile-update-otp")
    public ResponseEntity<?> sendMobileUpdateOtp(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody com.banking.payload.UpdateProfileRequest request) {
        try {
            if (request.getPhoneNumber() == null || request.getPhoneNumber().isEmpty()) {
                throw new RuntimeException("Phone number is required");
            }
            authService.generatePhoneOtp(userPrincipal, request.getPhoneNumber()); // Sends to NEW mobile
            return ResponseEntity.ok(new ApiResponse(true, "OTP sent to your new mobile number"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam String otp) {
        try {
            userService.deleteUserGlobal(userPrincipal.getId(), otp);
            return ResponseEntity.ok(new ApiResponse(true, "Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/set-tpin")
    public ResponseEntity<?> setTpin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody TpinRequest request) {
        try {
            userService.setTpin(userPrincipal.getId(), request.getTpin());
            return ResponseEntity.ok(new ApiResponse(true, "TPIN set successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/verify-tpin")
    public ResponseEntity<?> verifyTpin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody TpinRequest request) {
        try {
            boolean isValid = userService.verifyTpin(userPrincipal.getId(), request.getTpin());
            if (isValid) {
                return ResponseEntity.ok(new ApiResponse(true, "TPIN Verified"));
            } else {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid TPIN"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/send-tpin-otp")
    public ResponseEntity<?> sendTpinOtp(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // Prefer mobile OTP for TPIN actions as per requirement
            String method = authService.generateActionOtp(userPrincipal);
            String message = "MOBILE".equals(method)
                    ? "OTP sent to your registered mobile number."
                    : "OTP sent to your registered email address.";
            return ResponseEntity.ok(new ApiResponse(true, message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/reset-tpin")
    public ResponseEntity<?> resetTpin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody TpinRequest request) {
        try {
            userService.resetTpin(userPrincipal.getId(), request.getOtp(), request.getNewTpin());
            return ResponseEntity.ok(new ApiResponse(true, "TPIN reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/change-tpin")
    public ResponseEntity<?> changeTpin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request) {
        try {
            String oldTpin = request.get("oldTpin");
            String newTpin = request.get("newTpin");

            if (oldTpin == null || oldTpin.length() != 4 || newTpin == null || newTpin.length() != 4) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "TPIN must be 4 digits"));
            }

            userService.changeTpin(userPrincipal.getId(), oldTpin, newTpin);
            return ResponseEntity.ok(new ApiResponse(true, "Transaction PIN updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/set-login-pin")
    public ResponseEntity<?> setLoginPin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request) {
        try {
            String pin = request.get("pin");
            if (pin == null || pin.length() < 4) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "PIN must be at least 4 digits"));
            }
            userService.setLoginPin(userPrincipal.getId(), pin);
            return ResponseEntity.ok(new ApiResponse(true, "Login PIN set successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/reset-login-pin")
    public ResponseEntity<?> resetLoginPin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request) {
        try {
            String pin = request.get("pin");
            String otp = request.get("otp");
            if (pin == null || pin.length() < 4) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "PIN must be at least 4 digits"));
            }
            userService.resetLoginPin(userPrincipal.getId(), otp, pin);
            return ResponseEntity.ok(new ApiResponse(true, "Login PIN reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/change-login-pin")
    public ResponseEntity<?> changeLoginPin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request) {
        try {
            String oldPin = request.get("oldPin");
            String newPin = request.get("newPin");

            if (oldPin == null || oldPin.length() < 4 || newPin == null || newPin.length() < 4) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "PIN must be at least 4 digits"));
            }

            userService.changeLoginPin(userPrincipal.getId(), oldPin, newPin);
            return ResponseEntity.ok(new ApiResponse(true, "Login PIN updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotificationSettings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            return ResponseEntity.ok(userService.getNotificationSettings(userPrincipal.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/notifications")
    public ResponseEntity<?> updateNotificationSettings(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Boolean> settings) {
        try {
            userService.updateNotificationSettings(userPrincipal.getId(), settings);
            return ResponseEntity.ok(new ApiResponse(true, "Notification settings updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
