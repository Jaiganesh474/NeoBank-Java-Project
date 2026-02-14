package com.banking.payload;

import com.banking.model.Account.AccountType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAccountRequest {
    private AccountType accountType;
    private BigDecimal initialDeposit;
}
