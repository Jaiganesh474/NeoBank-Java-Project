package com.banking.controller;

import com.banking.model.UserDevice;
import com.banking.security.UserPrincipal;
import com.banking.service.UserDeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/devices")
@RequiredArgsConstructor
public class UserDeviceController {

    private final UserDeviceService userDeviceService;

    @GetMapping
    public ResponseEntity<List<UserDevice>> getDevices(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String currentRefreshToken) {
        System.out.println(
                "DEBUG: Fetching devices for user: " + userPrincipal.getId() + " - " + userPrincipal.getEmail());
        List<UserDevice> devices = userDeviceService.getUserDevices(userPrincipal.getId());
        System.out.println("DEBUG: Found " + (devices != null ? devices.size() : 0) + " devices");

        if (currentRefreshToken != null) {
            System.out.println("DEBUG: Comparing with currentRefreshToken: "
                    + (currentRefreshToken.length() > 10 ? currentRefreshToken.substring(0, 10) + "..." : "short"));
            devices.forEach(d -> {
                if (currentRefreshToken.equals(d.getRefreshToken())) {
                    d.setIsCurrent(true);
                } else {
                    d.setIsCurrent(false);
                }
            });
        }

        return ResponseEntity.ok(devices);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> logoutDevice(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long id) {
        userDeviceService.logoutDevice(userPrincipal.getId(), id);
        return ResponseEntity.ok().body(Map.of("success", true, "message", "Device logged out successfully"));
    }

    @DeleteMapping("/others")
    public ResponseEntity<?> logoutOtherDevices(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request) {
        String currentRefreshToken = request.get("refreshToken");
        if (currentRefreshToken == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Current refresh token is required"));
        }
        userDeviceService.logoutAllOtherDevices(userPrincipal.getId(), currentRefreshToken);
        return ResponseEntity.ok()
                .body(Map.of("success", true, "message", "All other devices logged out successfully"));
    }

    @DeleteMapping("/all")
    public ResponseEntity<?> logoutAllDevices(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        userDeviceService.logoutAllDevices(userPrincipal.getId());
        return ResponseEntity.ok().body(Map.of("success", true, "message", "All devices logged out successfully"));
    }
}
