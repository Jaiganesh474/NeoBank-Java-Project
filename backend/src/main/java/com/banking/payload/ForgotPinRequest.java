package com.banking.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPinRequest {
    @NotBlank
    private String identifier;
}
