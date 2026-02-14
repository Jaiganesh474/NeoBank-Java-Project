package com.banking.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TpinRequest {

    @NotBlank
    @Size(min = 4, max = 4)
    @Pattern(regexp = "^\\d{4}$", message = "TPIN must be 4 digits")
    private String tpin;

    private String otp; // Required for Reset confirmation or Initial Set if we want strict security
    private String newTpin; // For Reset flow

    // For TPIN verification during transaction
    private String password; // Optional: double security
}
