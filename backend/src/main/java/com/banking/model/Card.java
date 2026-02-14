package com.banking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String cardNumber; // Encrypted in real app, plain for demo

    @Column(nullable = false)
    private String cvv;

    @Column(nullable = false)
    private String expiryDate; // MM/YY

    @Column(nullable = false)
    private String cardHolderName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardType cardType = CardType.DEBIT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardStatus status = CardStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnore
    private Account account;

    @Column
    @JsonIgnore
    private String pin; // Encrypted ATM PIN

    // For convenience in frontend, we expose the linked account number if needed
    @Transient
    private String linkedAccountNumber;

    public String getLinkedAccountNumber() {
        return account != null ? account.getAccountNumber() : null;
    }

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum CardType {
        DEBIT,
        CREDIT,
        VIRTUAL
    }

    public enum CardStatus {
        ACTIVE,
        BLOCKED,
        EXPIRED
    }
}
