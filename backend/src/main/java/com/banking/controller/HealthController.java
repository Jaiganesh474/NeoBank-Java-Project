package com.banking.controller;

import com.google.firebase.FirebaseApp;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> checkHealth() {
        Map<String, Object> status = new HashMap<>();

        // Check DB
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            status.put("database", "UP");
        } catch (Exception e) {
            status.put("database", "DOWN: " + e.getMessage());
        }

        // Check Firebase
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                status.put("firebase", "UP (" + FirebaseApp.getInstance().getName() + ")");
            } else {
                status.put("firebase", "DOWN: No apps initialized");
            }
        } catch (Exception e) {
            status.put("firebase", "DOWN: " + e.getMessage());
        }

        status.put("status",
                status.get("database").equals("UP") && status.get("firebase").toString().startsWith("UP") ? "HEALTHY"
                        : "UNHEALTHY");

        return ResponseEntity.ok(status);
    }
}
