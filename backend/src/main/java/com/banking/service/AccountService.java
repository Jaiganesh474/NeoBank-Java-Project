package com.banking.service;

import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.model.User;
import com.banking.payload.TransferRequest;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import com.banking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final com.banking.repository.CardRepository cardRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public List<Account> getUserAccounts(UserPrincipal userPrincipal) {
        return accountRepository.findByUserId(userPrincipal.getId());
    }

    public Account getAccountById(UserPrincipal userPrincipal, Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getId().equals(userPrincipal.getId())) {
            throw new RuntimeException("Unauthorized access to account details");
        }

        return account;
    }

    @Transactional
    public Account createAccountWithOtp(UserPrincipal userPrincipal,
            com.banking.payload.CreateAccountWithPhoneOtpRequest request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String cleanPhone = sanitizePhone(request.getPhoneNumber());

        // Policy Check: Removed strict single-account limits. Users can now have
        // multiple accounts.

        Account account = new Account();
        account.setUser(user);
        account.setPhoneNumber(cleanPhone);
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getInitialDeposit() != null ? request.getInitialDeposit() : BigDecimal.ZERO);
        account.setAccountNumber(generateAccountNumber());
        account.setStatus(Account.AccountStatus.ACTIVE);

        // Primary Logic: Sync phone to user profile.
        // We now prioritize the most recent account opening phone number as the
        // user's primary contact.
        syncUserPhone(user, cleanPhone);

        return accountRepository.save(account);
    }

    private String sanitizePhone(String phoneNumber) {
        if (phoneNumber == null)
            return "";
        // Standardizing logic with AuthService
        String digits = phoneNumber.replaceAll("[^0-9]", "");

        if (digits.length() == 10) {
            return "+91" + digits;
        } else if (digits.length() > 10) {
            return "+" + digits;
        }
        return digits;
    }

    @Transactional
    public Transaction transferMoney(UserPrincipal userPrincipal, TransferRequest request) {
        Account fromAccount = accountRepository.findByAccountNumber(request.getFromAccountNumber())
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        if (!fromAccount.getUser().getId().equals(userPrincipal.getId())) {
            throw new RuntimeException("Unauthorized transfer attempt");
        }

        // Verify TPIN
        if (request.getTpin() == null || request.getTpin().isEmpty()) {
            throw new RuntimeException("TPIN is required");
        }

        User user = fromAccount.getUser();
        if (user.getTpin() == null || !passwordEncoder.matches(request.getTpin(), user.getTpin())) {
            throw new RuntimeException("Invalid TPIN");
        }

        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("Destination account not found"));

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        // Debit
        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        accountRepository.save(fromAccount);

        // Credit
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));
        accountRepository.save(toAccount);

        // Record Transaction for Sender
        Transaction transaction = new Transaction();
        transaction.setTransactionId(UUID.randomUUID().toString());
        transaction.setType(Transaction.TransactionType.TRANSFER);
        transaction.setAmount(request.getAmount());
        transaction.setAccount(fromAccount);
        transaction.setBalanceAfter(fromAccount.getBalance());
        transaction.setRecipientAccountNumber(toAccount.getAccountNumber());
        transaction.setRecipientName(toAccount.getUser().getFirstName() + " " + toAccount.getUser().getLastName());
        transaction.setDescription(request.getDescription());
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Mirror transaction for recipient
        Transaction creditTransaction = new Transaction();
        creditTransaction.setTransactionId("CR-" + UUID.randomUUID().toString());
        creditTransaction.setType(Transaction.TransactionType.DEPOSIT); // Use DEPOSIT for incoming
        creditTransaction.setAmount(request.getAmount());
        creditTransaction.setAccount(toAccount);
        creditTransaction.setBalanceAfter(toAccount.getBalance());
        creditTransaction.setRecipientAccountNumber(fromAccount.getAccountNumber()); // Source
        creditTransaction
                .setRecipientName(fromAccount.getUser().getFirstName() + " " + fromAccount.getUser().getLastName());
        creditTransaction.setDescription(
                "Received from " + fromAccount.getUser().getFirstName() + ": " + request.getDescription());
        creditTransaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        transactionRepository.save(creditTransaction);

        // Create structured notifications for real-time monitoring
        java.util.Map<String, Object> senderNotice = new java.util.HashMap<>();
        senderNotice.put("type", "BALANCE_UPDATE");
        senderNotice.put("message", String.format("Balance updated: -₹%,.2f", request.getAmount()));
        senderNotice.put("amount", request.getAmount().negate());

        java.util.Map<String, Object> receiverNotice = new java.util.HashMap<>();
        receiverNotice.put("type", "TRANSACTION_RECEIVED");
        receiverNotice.put("message", String.format("You received: ₹%,.2f from %s", request.getAmount(),
                fromAccount.getUser().getFirstName()));
        receiverNotice.put("amount", request.getAmount());

        // Notify Sender via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/user/" + fromAccount.getUser().getId(),
                senderNotice);

        // Notify Receiver via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/user/" + toAccount.getUser().getId(),
                receiverNotice);

        // Notify via Email (Mandatory for security)
        emailService.sendDebitNotification(
                fromAccount.getUser().getEmail(),
                fromAccount.getUser().getFirstName(),
                request.getAmount().toString(),
                toAccount.getUser().getFirstName() + " " + toAccount.getUser().getLastName(),
                savedTransaction.getTransactionId(),
                fromAccount.getAccountNumber(),
                toAccount.getAccountNumber(),
                fromAccount.getBalance().toString());

        emailService.sendCreditNotification(
                toAccount.getUser().getEmail(),
                toAccount.getUser().getFirstName(),
                request.getAmount().toString(),
                fromAccount.getUser().getFirstName() + " " + fromAccount.getUser().getLastName(),
                creditTransaction.getTransactionId(),
                toAccount.getAccountNumber(),
                fromAccount.getAccountNumber(),
                toAccount.getBalance().toString());

        return savedTransaction;
    }

    private String generateAccountNumber() {
        // Generate a 12-digit random number
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 12; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    public List<Transaction> getAccountTransactions(UserPrincipal userPrincipal, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getId().equals(userPrincipal.getId())) {
            throw new RuntimeException("Unauthorized access to account transactions");
        }

        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public List<Transaction> getAllUserTransactions(UserPrincipal userPrincipal) {
        return transactionRepository.findAllByUserId(userPrincipal.getId());
    }

    @Transactional
    public void deleteAccount(UserPrincipal userPrincipal, Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getId().equals(userPrincipal.getId())) {
            throw new RuntimeException("Unauthorized account deletion attempt");
        }

        // 1. Delete associated transactions first (FK constraint)
        transactionRepository.deleteByAccountId(account.getId());

        // 2. Delete associated cards (FK constraint)
        cardRepository.deleteByAccountId(account.getId());

        // 3. Finally delete the account
        User user = account.getUser();
        accountRepository.delete(account);

        // 4. Sync profile number from remaining accounts
        updateUserProfilePhone(user);
    }

    private void syncUserPhone(User user, String cleanPhone) {
        try {
            // Only sync if it's not already set to this number
            if (!cleanPhone.equals(user.getPhoneNumber())) {
                // Check if another user already has this phone number to avoid DB constraint
                // failure
                userRepository.findByPhoneNumber(cleanPhone).ifPresent(otherUser -> {
                    if (!otherUser.getId().equals(user.getId())) {
                        throw new RuntimeException("This phone number is already registered with another profile.");
                    }
                });

                user.setPhoneNumber(cleanPhone);
                userRepository.save(user);
            }
        } catch (Exception e) {
            System.err.println("WARNING: Could not sync phone to user profile: " + e.getMessage());
            // We don't necessarily want to crash the whole account opening if profile sync
            // fails,
            // but the uniqueness constraint is important.
        }
    }

    private void updateUserProfilePhone(User user) {
        try {
            List<Account> remainingAccounts = accountRepository.findByUserId(user.getId());
            if (!remainingAccounts.isEmpty()) {
                // Take the phone number from the most recent/available account
                user.setPhoneNumber(remainingAccounts.get(0).getPhoneNumber());
            } else {
                // Optional: Clear or keep? User says it should get updated.
                // If they have no accounts, maybe leave it or clear?
                // Let's keep it for now so they don't lose contact info,
                // but usually in a bank if all products are gone, the profile might stay.
            }
            userRepository.save(user);
        } catch (Exception e) {
            System.err.println("WARNING: Could not update user profile phone after deletion: " + e.getMessage());
        }
    }
}
