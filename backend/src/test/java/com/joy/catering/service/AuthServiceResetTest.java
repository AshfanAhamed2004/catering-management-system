package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.ResetPassword;
import com.joy.catering.model.*;
import com.joy.catering.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

// ResetPassword record order: (password, passwordConfirmation, token)

@SpringBootTest
@Transactional
public class AuthServiceResetTest {

    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetRepository passwordResetRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private User testUser;
    private PasswordReset validToken;
    private static final String RAW_TOKEN = "test-reset-token-for-authservice-tests-xyz";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("reset-test-" + System.currentTimeMillis() + "@example.com");
        testUser.setPasswordHash(passwordEncoder.encode("OldPass1"));
        testUser.setRole(Role.CUSTOMER);
        CustomerProfile profile = new CustomerProfile();
        profile.setUser(testUser);
        profile.setFullName("Reset Test User");
        profile.setMobileNumber("0700000000");
        profile.setAddress("Test St");
        testUser.setProfile(profile);
        testUser = userRepository.save(testUser);

        validToken = new PasswordReset();
        validToken.setUser(testUser);
        validToken.setTokenHash(sha256hex(RAW_TOKEN));
        validToken.setExpiresAt(OffsetDateTime.now().plusMinutes(15));
        validToken.setUsed(false);
        validToken = passwordResetRepository.save(validToken);
    }

    @Test
    void reset_success_passwordIsUpdatedAndTokenMarkedUsed() {
        // ResetPassword(password, passwordConfirmation, token)
        authService.reset(new ResetPassword("NewPass2", "NewPass2", RAW_TOKEN));

        User updated = userRepository.findById(testUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("NewPass2", updated.getPasswordHash()));

        PasswordReset usedToken = passwordResetRepository.findById(validToken.getId()).orElseThrow();
        assertTrue(usedToken.isUsed());
    }

    @Test
    void reset_tokenVersionIncrements() {
        int versionBefore = testUser.getTokenVersion();
        authService.reset(new ResetPassword("NewPass2", "NewPass2", RAW_TOKEN));

        User updated = userRepository.findById(testUser.getId()).orElseThrow();
        assertEquals(versionBefore + 1, updated.getTokenVersion());
    }

    @Test
    void reset_passwordMismatch_throwsBadRequest_noDbChange() {
        ApiException ex = assertThrows(ApiException.class,
                () -> authService.reset(new ResetPassword("NewPass2", "WrongPass3", RAW_TOKEN)));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());

        User unchanged = userRepository.findById(testUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("OldPass1", unchanged.getPasswordHash()));

        PasswordReset token = passwordResetRepository.findById(validToken.getId()).orElseThrow();
        assertFalse(token.isUsed());
    }

    @Test
    void reset_expiredToken_throwsBadRequest() {
        validToken.setExpiresAt(OffsetDateTime.now().minusMinutes(1));
        passwordResetRepository.save(validToken);

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.reset(new ResetPassword("NewPass2", "NewPass2", RAW_TOKEN)));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void reset_alreadyUsedToken_throwsBadRequest() {
        validToken.setUsed(true);
        passwordResetRepository.save(validToken);

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.reset(new ResetPassword("NewPass2", "NewPass2", RAW_TOKEN)));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void reset_inactiveUser_throwsBadRequest() {
        testUser.setActive(false);
        userRepository.save(testUser);

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.reset(new ResetPassword("NewPass2", "NewPass2", RAW_TOKEN)));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void reset_wrongToken_throwsBadRequest() {
        ApiException ex = assertThrows(ApiException.class,
                () -> authService.reset(new ResetPassword("NewPass2", "NewPass2", "completely-wrong-token")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    private static String sha256hex(String s) {
        try {
            byte[] digest = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(s.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (Exception e) { throw new RuntimeException(e); }
    }
}