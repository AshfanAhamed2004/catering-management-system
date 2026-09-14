package com.joy.catering.model;
public enum FeedbackStatus {
    // Legacy statuses for safe DB deserialization
    @Deprecated NEW, @Deprecated IN_REVIEW, @Deprecated CLOSED,
    
    // Target workflow
    SUBMITTED, UNDER_REVIEW, RESPONDED, RESOLVED, ARCHIVED
}
