package com.catering.crm.model;

import java.sql.Date;
import java.sql.Timestamp;

/**
 * Inquiry entity representing a catering request and booking pipeline stage.
 */
public class Inquiry {
    private int inquiryId;
    private int customerId;
    private Customer customer;
    private String eventType;
    private Date eventDate;
    private int guestCount;
    private String venueLocation;
    private String cateringStyle;
    private double budgetEstimate;
    private String communicationChannel;
    private InquiryStatus status;
    private String dietaryNotes;
    private String followUpNotes;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Inquiry() {
        this.status = InquiryStatus.NEW;
    }

    public Inquiry(int inquiryId, int customerId, String eventType, Date eventDate, int guestCount,
                   String venueLocation, String cateringStyle, double budgetEstimate,
                   String communicationChannel, InquiryStatus status, String dietaryNotes,
                   String followUpNotes) {
        this.inquiryId = inquiryId;
        this.customerId = customerId;
        this.eventType = eventType;
        this.eventDate = eventDate;
        this.guestCount = guestCount;
        this.venueLocation = venueLocation;
        this.cateringStyle = cateringStyle;
        this.budgetEstimate = budgetEstimate;
        this.communicationChannel = communicationChannel;
        this.status = status != null ? status : InquiryStatus.NEW;
        this.dietaryNotes = dietaryNotes;
        this.followUpNotes = followUpNotes;
    }

    public int getInquiryId() {
        return inquiryId;
    }

    public void setInquiryId(int inquiryId) {
        this.inquiryId = inquiryId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
        if (customer != null) {
            this.customerId = customer.getCustomerId();
        }
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Date getEventDate() {
        return eventDate;
    }

    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }

    public int getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(int guestCount) {
        this.guestCount = guestCount;
    }

    public String getVenueLocation() {
        return venueLocation;
    }

    public void setVenueLocation(String venueLocation) {
        this.venueLocation = venueLocation;
    }

    public String getCateringStyle() {
        return cateringStyle;
    }

    public void setCateringStyle(String cateringStyle) {
        this.cateringStyle = cateringStyle;
    }

    public double getBudgetEstimate() {
        return budgetEstimate;
    }

    public void setBudgetEstimate(double budgetEstimate) {
        this.budgetEstimate = budgetEstimate;
    }

    public String getCommunicationChannel() {
        return communicationChannel;
    }

    public void setCommunicationChannel(String communicationChannel) {
        this.communicationChannel = communicationChannel;
    }

    public InquiryStatus getStatus() {
        return status;
    }

    public void setStatus(InquiryStatus status) {
        this.status = status;
    }

    public String getDietaryNotes() {
        return dietaryNotes;
    }

    public void setDietaryNotes(String dietaryNotes) {
        this.dietaryNotes = dietaryNotes;
    }

    public String getFollowUpNotes() {
        return followUpNotes;
    }

    public void setFollowUpNotes(String followUpNotes) {
        this.followUpNotes = followUpNotes;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
