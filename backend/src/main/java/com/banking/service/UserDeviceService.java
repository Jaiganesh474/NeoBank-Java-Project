package com.banking.service;

import com.banking.model.User;
import com.banking.model.UserDevice;
import com.banking.repository.UserDeviceRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDeviceService {

    private final UserDeviceRepository userDeviceRepository;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void recordDevice(User user, String refreshToken, HttpServletRequest request) {
        try {
            String userAgent = request.getHeader("User-Agent");
            String ipAddress = getClientIp(request);

            UserDevice device = new UserDevice();
            device.setUser(user);
            device.setRefreshToken(refreshToken);
            device.setIpAddress(ipAddress);
            device.setLastActive(java.time.LocalDateTime.now());

            // Basic User Agent Parsing
            parseUserAgent(userAgent, device);

            // Default location (could be enhanced with IP geolocation API)
            device.setLocation("Unknown Location");

            userDeviceRepository.save(device);
            System.out.println("Recorded device for user: " + user.getEmail() + " - " + device.getDeviceName());
        } catch (Exception e) {
            System.err.println("Failed to record device for user: " + user.getEmail() + " - " + e.getMessage());
        }
    }

    public List<UserDevice> getUserDevices(Long userId) {
        System.out.println("Fetching devices for userId: " + userId);
        return userDeviceRepository.findByUserIdCustom(userId);
    }

    @Transactional
    public void logoutDevice(Long userId, Long deviceId) {
        userDeviceRepository.findById(deviceId).ifPresent(device -> {
            if (device.getUser().getId().equals(userId)) {
                userDeviceRepository.delete(device);
                System.out.println("Logged out device: " + deviceId + " for user: " + userId);
            }
        });
    }

    @Transactional
    public void logoutAllOtherDevices(Long userId, String currentRefreshToken) {
        userDeviceRepository.findByRefreshToken(currentRefreshToken).ifPresent(current -> {
            userDeviceRepository.deleteOtherDevices(userId, current.getId());
            System.out.println("Logged out all other devices for user: " + userId);
        });
    }

    @Transactional
    public void logoutAllDevices(Long userId) {
        userDeviceRepository.deleteAllUserDevices(userId);
        System.out.println("Logged out all devices for user: " + userId);
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = "";
        if (request != null) {
            remoteAddr = request.getHeader("X-FORWARDED-FOR");
            if (remoteAddr == null || "".equals(remoteAddr)) {
                remoteAddr = request.getRemoteAddr();
            }
        }
        // In local dev, it might be 0:0:0:0:0:0:0:1
        if ("0:0:0:0:0:0:0:1".equals(remoteAddr)) {
            remoteAddr = "127.0.0.1";
        }
        return remoteAddr;
    }

    private void parseUserAgent(String userAgent, UserDevice device) {
        if (userAgent == null) {
            device.setDeviceName("Unknown Device");
            device.setBrowser("Unknown Browser");
            device.setOs("Unknown OS");
            return;
        }

        String ua = userAgent.toLowerCase();

        // OS
        if (ua.contains("windows"))
            device.setOs("Windows");
        else if (ua.contains("macintosh") || ua.contains("mac os"))
            device.setOs("macOS");
        else if (ua.contains("iphone"))
            device.setOs("iOS");
        else if (ua.contains("android"))
            device.setOs("Android");
        else if (ua.contains("linux"))
            device.setOs("Linux");
        else
            device.setOs("Unknown OS");

        // Browser
        if (ua.contains("edg/"))
            device.setBrowser("Edge");
        else if (ua.contains("chrome") && !ua.contains("chromium"))
            device.setBrowser("Chrome");
        else if (ua.contains("safari") && !ua.contains("chrome"))
            device.setBrowser("Safari");
        else if (ua.contains("firefox"))
            device.setBrowser("Firefox");
        else if (ua.contains("opr/") || ua.contains("opera"))
            device.setBrowser("Opera");
        else
            device.setBrowser("Browser");

        // Device Name
        if (ua.contains("iphone"))
            device.setDeviceName("iPhone");
        else if (ua.contains("ipad"))
            device.setDeviceName("iPad");
        else if (ua.contains("android"))
            device.setDeviceName("Android Mobile");
        else if (ua.contains("windows"))
            device.setDeviceName("Windows PC");
        else if (ua.contains("macintosh"))
            device.setDeviceName("Mac");
        else
            device.setDeviceName("Desktop");
    }
}
