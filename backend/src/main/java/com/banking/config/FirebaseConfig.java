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

    @PostConstruct
    public void initialize() {
        try {
            if (firebaseConfig != null && firebaseConfig.exists()) {
                InputStream serviceAccount = firebaseConfig.getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    System.out.println("Firebase initialized successfully using config: " + firebaseConfig);
                }
            } else {
                System.err.println("CRITICAL: Firebase config file NOT FOUND at: " + firebaseConfig);
                System.err.println("Please check your firebase.config.path environment variable.");
            }
        } catch (IOException e) {
            System.err.println("CRITICAL ERROR during Firebase initialization: " + e.getMessage());
        }
    }
}
