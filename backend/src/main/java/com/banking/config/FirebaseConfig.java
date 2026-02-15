package com.banking.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path:classpath:serviceAccountKey.json}")
    private Resource firebaseConfig;

    @Value("${FIREBASE_SERVICE_ACCOUNT:none}")
    private String firebaseServiceAccountJson;

    @PostConstruct
    public void initialize() {
        try {
            FirebaseOptions options = null;

            // Priority 1: Use Raw JSON from environment variable (Best for
            // Render/Production)
            if (firebaseServiceAccountJson != null && !firebaseServiceAccountJson.equals("none")
                    && !firebaseServiceAccountJson.isEmpty()) {
                System.out.println("Firebase: Initializing using FIREBASE_SERVICE_ACCOUNT environment variable.");
                try (InputStream is = new java.io.ByteArrayInputStream(firebaseServiceAccountJson.getBytes())) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(is))
                            .build();
                }
            }
            // Priority 2: Use file path if it exists
            else if (firebaseConfig != null && firebaseConfig.exists()) {
                System.out.println("Firebase: Initializing using config file: " + firebaseConfig);
                try (InputStream serviceAccount = firebaseConfig.getInputStream()) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                }
            }

            if (options != null) {
                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    System.out.println("Firebase initialized successfully.");
                }
            } else {
                System.err.println(
                        "CRITICAL: Firebase could not be initialized. Neither FIREBASE_SERVICE_ACCOUNT env var nor config file found.");
            }
        } catch (IOException e) {
            System.err.println("CRITICAL ERROR during Firebase initialization: " + e.getMessage());
        }
    }
}
