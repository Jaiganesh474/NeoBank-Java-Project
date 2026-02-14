package com.banking.security;

import com.banking.model.User;
import com.banking.repository.UserRepository;
import com.banking.service.UserService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // Skip Firebase check if user is already authenticated (e.g., by JWT filter)
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        if (header != null && header.startsWith("Bearer ")) {
            String idToken = header.substring(7);
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String email = decodedToken.getEmail();

                if (email != null) {
                    User user = userRepository.findByEmail(email).orElseGet(() -> {
                        // Auto-register user if they exist in Firebase but not in our DB
                        return userService.registerFirebaseUser(decodedToken);
                    });

                    UserPrincipal userPrincipal = UserPrincipal.create(user);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userPrincipal, null, userPrincipal.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // If it's a critical error (like DB failure), log as ERROR
                if (e.getMessage() != null
                        && (e.getMessage().contains("execute statement") || e.getMessage().contains("constraint"))) {
                    logger.error("CRITICAL ERROR during Firebase user sync: " + e.getMessage(), e);
                } else {
                    // Not a Firebase token, or verification failed.
                    // Log at DEBUG level to avoid noise for valid JWTs
                    logger.debug("Firebase token info: " + e.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
