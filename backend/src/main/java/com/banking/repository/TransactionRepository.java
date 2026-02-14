package com.banking.repository;

import com.banking.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByAccountId(Long accountId, Pageable pageable);

    List<Transaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);

    List<Transaction> findByAccountIdAndCreatedAtBetween(Long accountId, LocalDateTime start, LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId ORDER BY t.createdAt DESC")
    List<Transaction> findAllByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Transaction t WHERE t.account.id = :accountId")
    void deleteByAccountId(@org.springframework.data.repository.query.Param("accountId") Long accountId);
}
