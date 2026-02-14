package com.banking.payload;

import lombok.Data;
import java.util.List;

@Data
public class JwtAuthenticationResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";

    private Long id;
    private String email;
    private String firstName;
    private List<String> roles;
    private String lastLogin;
    private String phoneNumber;
    private String profileImageUrl;
    private Boolean tpinSet;
    private Boolean loginPinSet;

    public JwtAuthenticationResponse(String accessToken, String refreshToken, Long id, String email, String firstName,
            List<String> roles, String lastLogin, String phoneNumber, String profileImageUrl, Boolean tpinSet,
            Boolean loginPinSet) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.roles = roles;
        this.lastLogin = lastLogin;
        this.phoneNumber = phoneNumber;
        this.profileImageUrl = profileImageUrl;
        this.tpinSet = tpinSet;
        this.loginPinSet = loginPinSet;
    }
}
