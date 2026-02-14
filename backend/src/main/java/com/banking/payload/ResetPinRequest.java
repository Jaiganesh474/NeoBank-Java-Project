package com.banking.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPinRequest {
    @NotBlank
    private String identifier;

    @NotBlank
    private String otp;

    @NotBlank
    private String newPin;
}
