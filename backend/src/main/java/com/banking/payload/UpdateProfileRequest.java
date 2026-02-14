package com.banking.payload;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String otp;
}
