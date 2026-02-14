package com.banking.payload;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String newPassword;
    private String otp;
}
