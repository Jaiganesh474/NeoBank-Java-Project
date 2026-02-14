package com.banking.repository;

import com.banking.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findByAccountId(Long accountId);

    Optional<Card> findByCardNumber(String cardNumber);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Card c WHERE c.account.id = :accountId")
    void deleteByAccountId(@org.springframework.data.repository.query.Param("accountId") Long accountId);
}
