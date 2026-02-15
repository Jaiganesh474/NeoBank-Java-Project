package com.banking.payload;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class FirebaseLoginRequest {
    @NotBlank
    private String idToken;
}
