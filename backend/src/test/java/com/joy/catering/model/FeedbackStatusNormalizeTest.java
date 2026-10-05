package com.joy.catering.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class FeedbackStatusNormalizeTest {

    @Test
    void normalize_NEW_returnsSUBMITTED() {
        assertEquals(FeedbackStatus.SUBMITTED, FeedbackStatus.NEW.normalize());
    }

    @Test
    void normalize_IN_REVIEW_returnsUNDER_REVIEW() {
        assertEquals(FeedbackStatus.UNDER_REVIEW, FeedbackStatus.IN_REVIEW.normalize());
    }

    @Test
    void normalize_CLOSED_returnsARCHIVED() {
        assertEquals(FeedbackStatus.ARCHIVED, FeedbackStatus.CLOSED.normalize());
    }

    @Test
    void normalize_SUBMITTED_passesThrough() {
        assertEquals(FeedbackStatus.SUBMITTED, FeedbackStatus.SUBMITTED.normalize());
    }

    @Test
    void normalize_UNDER_REVIEW_passesThrough() {
        assertEquals(FeedbackStatus.UNDER_REVIEW, FeedbackStatus.UNDER_REVIEW.normalize());
    }

    @Test
    void normalize_RESPONDED_passesThrough() {
        assertEquals(FeedbackStatus.RESPONDED, FeedbackStatus.RESPONDED.normalize());
    }

    @Test
    void normalize_RESOLVED_passesThrough() {
        assertEquals(FeedbackStatus.RESOLVED, FeedbackStatus.RESOLVED.normalize());
    }

    @Test
    void normalize_ARCHIVED_passesThrough() {
        assertEquals(FeedbackStatus.ARCHIVED, FeedbackStatus.ARCHIVED.normalize());
    }

    @Test
    void normalize_isIdempotent_forAllLegacyValues() {
        assertEquals(FeedbackStatus.NEW.normalize(), FeedbackStatus.NEW.normalize().normalize());
        assertEquals(FeedbackStatus.IN_REVIEW.normalize(), FeedbackStatus.IN_REVIEW.normalize().normalize());
        assertEquals(FeedbackStatus.CLOSED.normalize(), FeedbackStatus.CLOSED.normalize().normalize());
    }

    @Test
    void normalize_neverReturnsLegacyValue() {
        for (FeedbackStatus s : FeedbackStatus.values()) {
            FeedbackStatus normalized = s.normalize();
            assertNotEquals(FeedbackStatus.NEW, normalized, "normalize() must never return NEW for input: " + s);
            assertNotEquals(FeedbackStatus.IN_REVIEW, normalized, "normalize() must never return IN_REVIEW for input: " + s);
            assertNotEquals(FeedbackStatus.CLOSED, normalized, "normalize() must never return CLOSED for input: " + s);
        }
    }
}