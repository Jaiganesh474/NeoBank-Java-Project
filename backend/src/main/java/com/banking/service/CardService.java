package com.banking.service;

import com.banking.model.Account;
import com.banking.model.Card;
import com.banking.repository.AccountRepository;
import com.banking.repository.CardRepository;
import com.banking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Optional<Card> getCardForUser(UserPrincipal user) {
        // Assume user has at least one account, try to find a linked card
        Optional<Account> account = accountRepository.findByUserId(user.getId()).stream().findFirst();
        if (account.isPresent()) {
            return cardRepository.findByAccountId(account.get().getId());
        }
        return Optional.empty();
    }

    @Transactional
    public void updateCardPin(UserPrincipal user, Long cardId, String pin, String otp) {
        // 1. Verify OTP
        authService.verifyActionOtp(user, otp);

        // 2. Find Card
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        // 3. Verify ownership (via account)
        if (!card.getAccount().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this card");
        }

        card.setPin(passwordEncoder.encode(pin));
        cardRepository.save(card);
    }

    @Transactional
    public void deleteCard(UserPrincipal user, Long cardId, String otp) {
        authService.verifyActionOtp(user, otp);
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        if (!card.getAccount().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        cardRepository.delete(card);
    }

    @Transactional
    public void unlinkCard(UserPrincipal user, Long cardId, String otp) {
        authService.verifyActionOtp(user, otp);
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        if (!card.getAccount().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        // Since account is not nullable, unlinking logically blocks it or marks it.
        // Let's set status to BLOCKED as a way of 'unlinking' it from active use.
        card.setStatus(Card.CardStatus.BLOCKED);
        cardRepository.save(card);
    }

    @Transactional
    public Card issueNewDebitCard(UserPrincipal user, String otp) {
        // 1. Get User's Account (Primary)
        Account account = accountRepository.findByUserId(user.getId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active account found. Please open an account first."));

        // 2. Verify Security Code
        authService.verifyActionOtp(user, otp);

        // 3. Check if card already exists
        if (cardRepository.findByAccountId(account.getId()).isPresent()) {
            throw new RuntimeException("A Debit Card is already issued for this account.");
        }

        // 4. Generate Random Card Details
        String cardNumber = generateUniqueCardNumber();
        String cvv = String.format("%03d", new Random().nextInt(1000));
        String expiry = generateExpiryDate();

        // 5. Create Card Entity
        Card card = new Card();
        card.setCardNumber(cardNumber);
        card.setCvv(cvv);
        card.setExpiryDate(expiry);
        card.setCardHolderName(user.getFirstName() != null ? user.getFirstName().toUpperCase() : "VALUED CUSTOMER");
        card.setAccount(account);
        card.setStatus(Card.CardStatus.ACTIVE);
        card.setCardType(Card.CardType.DEBIT);

        return cardRepository.save(card);
    }

    private String generateUniqueCardNumber() {
        Random random = new Random();
        String cardNumber;
        do {
            // Visa Prefix (4) + 15 random digits
            StringBuilder sb = new StringBuilder("4");
            for (int i = 0; i < 15; i++) {
                sb.append(random.nextInt(10));
            }
            cardNumber = formatCardNumber(sb.toString());
        } while (cardRepository.findByCardNumber(cardNumber).isPresent());

        return cardNumber;
    }

    // Helper to format as XXXX XXXX XXXX XXXX if needed, but entity stores raw or
    // formatted?
    // Let's store space-separated for display ease: "4532 1234 5678 9012"
    private String formatCardNumber(String raw) {
        return raw.replaceAll("(.{4})", "$1 ").trim();
    }

    private String generateExpiryDate() {
        LocalDate expiry = LocalDate.now().plusYears(5); // 5 Years validity
        return expiry.format(DateTimeFormatter.ofPattern("MM/yy"));
    }
}
