package com.banking.payload;

import com.banking.model.Account.AccountType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAccountWithPhoneOtpRequest {
    private String phoneNumber;
    private String otp;
    private AccountType accountType;
    private BigDecimal initialDeposit;
}
