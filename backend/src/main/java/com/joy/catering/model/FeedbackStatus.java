package com.joy.catering.model;

public enum FeedbackStatus {
    // Legacy statuses retained ONLY for safe DB deserialization of pre-migration rows.
    // Do NOT use these in new code. Call normalize() before presenting to callers.
    @Deprecated NEW,
    @Deprecated IN_REVIEW,
    @Deprecated CLOSED,

    // Canonical workflow statuses
    SUBMITTED, UNDER_REVIEW, RESPONDED, RESOLVED, ARCHIVED;

    /**
     * Converts any legacy status value to its canonical equivalent.
     * NEW       -> SUBMITTED
     * IN_REVIEW -> UNDER_REVIEW
     * CLOSED    -> ARCHIVED
     * All canonical values pass through unchanged.
     *
     * This method is the single authoritative mapping for the whole application.
     * All API response mappers must call this so that staff Feedback and CRM
     * Customer 360 always present the same status semantics for the same record.
     */
    public FeedbackStatus normalize() {
        return switch (this) {
            case NEW -> SUBMITTED;
            case IN_REVIEW -> UNDER_REVIEW;
            case CLOSED -> ARCHIVED;
            default -> this;
        };
    }
}
