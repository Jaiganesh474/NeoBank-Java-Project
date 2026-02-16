package com.banking.controller;

import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.payload.TransferRequest;
import com.banking.security.UserPrincipal;
import com.banking.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final com.banking.service.AuthService authService;

    @GetMapping
    public List<Account> getUserAccounts(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return accountService.getUserAccounts(userPrincipal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountDetails(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(userPrincipal, id));
    }

    @PostMapping("/transfer")
    public ResponseEntity<Transaction> transferMoney(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody TransferRequest request) {
        return ResponseEntity.ok(accountService.transferMoney(userPrincipal, request));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getAllUserTransactions(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(accountService.getAllUserTransactions(userPrincipal));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> getAccountTransactions(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountTransactions(userPrincipal, id));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendPhoneOtp(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String phoneNumber = request.get("phoneNumber");
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new com.banking.payload.ApiResponse(false, "Phone number is required"));
            }
            authService.generatePhoneOtp(userPrincipal, phoneNumber);
            return ResponseEntity.ok(
                    new com.banking.payload.ApiResponse(true, "OTP sent successfully to " + phoneNumber));
        } catch (Exception e) {
            System.err.println("ERROR in sendPhoneOtp: " + e.getMessage());
            return ResponseEntity.badRequest().body(new com.banking.payload.ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/create-with-otp")
    public ResponseEntity<?> createAccountWithOtp(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody com.banking.payload.CreateAccountWithPhoneOtpRequest request) {
        try {
            authService.verifyPhoneOtp(request.getPhoneNumber(), request.getOtp());
            return ResponseEntity.ok(accountService.createAccountWithOtp(userPrincipal, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.banking.payload.ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id, @RequestParam(required = true) String otp) {
        try {
            authService.verifyMobileActionOtp(userPrincipal, otp);
            accountService.deleteAccount(userPrincipal, id);
            return ResponseEntity.ok(new com.banking.payload.ApiResponse(true, "Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.banking.payload.ApiResponse(false, e.getMessage()));
        }
    }
}
