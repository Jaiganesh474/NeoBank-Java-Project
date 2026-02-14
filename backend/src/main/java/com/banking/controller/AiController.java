package com.banking.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    @Value("${google.gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Switched to v1 stable for better compatibility. Note: 1.5-flash is currently
    // the stable version.
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=";

    @PostMapping("/chat")
    public ResponseEntity<?> getAiResponse(@RequestBody ChatRequest request) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_GEMINI_API_KEY".equals(apiKey)) {
            return ResponseEntity.ok(Map.of("response",
                    "AI Assistant is not configured. Please add your Google Gemini API Key in application.properties."));
        }

        String url = GEMINI_URL + apiKey;

        // Structured message for Gemini
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text",
                                        "You are a helpful NeoBank financial assistant. Help the user with banking questions. Keep responses concise and professional. User message: "
                                                + request.getMessage())))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Added User-Agent as some Google API endpoints require it
        headers.set("User-Agent", "NeoBank-Backend/1.0");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<>() {
            };
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, entity, typeRef);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null || !responseBody.containsKey("candidates")) {
                System.err.println("Gemini Response missing candidates: " + responseBody);
                return ResponseEntity.ok(Map.of("response", "I'm sorry, Gemini returned an unexpected response."));
            }

            List<?> candidates = (List<?>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return ResponseEntity.ok(Map.of("response", "Gemini AI is thinking, but no answer came out."));
            }

            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            if (content == null) {
                // This often happens due to safety filters
                return ResponseEntity
                        .ok(Map.of("response", "The AI model blocked this response due to safety filters."));
            }

            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            String aiText = (String) firstPart.get("text");

            return ResponseEntity.ok(Map.of("response", aiText));
        } catch (HttpStatusCodeException e) {
            System.err.println("Gemini API HTTP Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", "AI API Error: " + e.getResponseBodyAsString()));
        } catch (Exception e) {
            System.err.println("Gemini Internal Error:");
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error: " + e.getMessage()));
        }
    }

    @Data
    public static class ChatRequest {
        private String message;
    }
}
