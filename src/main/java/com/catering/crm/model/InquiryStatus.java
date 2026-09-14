package com.catering.crm.model;

/**
 * Represents the lifecycle stages of an event inquiry in Culinary Connect Catering.
 */
public enum InquiryStatus {
    NEW("New Lead"),
    CONTACTED("Contacted"),
    QUOTATION_SENT("Quotation Sent"),
    CONFIRMED("Confirmed"),
    CANCELLED("Cancelled");

    private final String displayName;

    InquiryStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static InquiryStatus fromString(String text) {
        if (text == null) return NEW;
        for (InquiryStatus s : InquiryStatus.values()) {
            if (s.name().equalsIgnoreCase(text.trim()) || s.displayName.equalsIgnoreCase(text.trim())) {
                return s;
            }
        }
        return NEW;
    }
}
