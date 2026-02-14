package com.banking.controller;

import com.banking.model.Card;
import com.banking.payload.ApiResponse;
import com.banking.security.UserPrincipal;
import com.banking.service.AuthService;
import com.banking.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<?> getCard(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return cardService.getCardForUser(userPrincipal)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendCardOtp(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            authService.generateActionOtp(userPrincipal);
            return ResponseEntity.ok(new ApiResponse(true, "OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueCard(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request) {
        try {
            String otp = request.get("otp");
            if (otp == null || otp.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "OTP is required"));
            }
            Card card = cardService.issueNewDebitCard(userPrincipal, otp);
            return ResponseEntity.ok(card);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/pin")
    public ResponseEntity<?> updatePin(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String pin = request.get("pin");
            String otp = request.get("otp");
            if (pin == null || pin.length() != 4) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "PIN must be 4 digits"));
            }
            if (otp == null || otp.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "OTP is required"));
            }
            cardService.updateCardPin(userPrincipal, id, pin, otp);
            return ResponseEntity.ok(new ApiResponse(true, "Card PIN updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCard(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam String otp) {
        try {
            cardService.deleteCard(userPrincipal, id, otp);
            return ResponseEntity.ok(new ApiResponse(true, "Card deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{id}/unlink")
    public ResponseEntity<?> unlinkCard(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam String otp) {
        try {
            cardService.unlinkCard(userPrincipal, id, otp);
            return ResponseEntity.ok(new ApiResponse(true, "Card unlinked / blocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
