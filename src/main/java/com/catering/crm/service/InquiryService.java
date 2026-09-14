package com.catering.crm.service;

import com.catering.crm.dao.InquiryDAO;
import com.catering.crm.dao.InquiryDAOImpl;
import com.catering.crm.model.Customer;
import com.catering.crm.model.Inquiry;
import com.catering.crm.model.InquiryStatus;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Service layer implementing core business logic and rigorous input validations
 * for the CRM and Inquiry Consolidation module.
 */
public class InquiryService {

    private final InquiryDAO inquiryDAO;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9+()\\s-]{9,15}$");

    public InquiryService() {
        this(new InquiryDAOImpl());
    }

    public InquiryService(InquiryDAO inquiryDAO) {
        this.inquiryDAO = inquiryDAO;
    }

    public List<Inquiry> getAllInquiries() {
        return inquiryDAO.getAllInquiries();
    }

    public List<Inquiry> searchAndFilter(String query, String status, String channel) {
        return inquiryDAO.searchAndFilterInquiries(query, status, channel);
    }

    public Inquiry getInquiry(int id) {
        return inquiryDAO.getInquiryById(id);
    }

    /**
     * Validates and registers a new customer inquiry.
     */
    public boolean registerInquiry(Inquiry inquiry) throws ValidationException {
        validateInquiry(inquiry);
        return inquiryDAO.createInquiry(inquiry);
    }

    /**
     * Validates and updates an existing customer inquiry.
     */
    public boolean updateInquiry(Inquiry inquiry) throws ValidationException {
        if (inquiry.getInquiryId() <= 0) {
            throw new ValidationException("Invalid inquiry ID for update.");
        }
        validateInquiry(inquiry);
        return inquiryDAO.updateInquiry(inquiry);
    }

    /**
     * Advances or changes the status of an inquiry in the pipeline.
     */
    public boolean updateStatus(int inquiryId, InquiryStatus newStatus) throws ValidationException {
        if (inquiryId <= 0) {
            throw new ValidationException("Inquiry ID is required.");
        }
        if (newStatus == null) {
            throw new ValidationException("New status cannot be null.");
        }
        return inquiryDAO.updateInquiryStatus(inquiryId, newStatus);
    }

    /**
     * Removes an inquiry from the system.
     */
    public boolean removeInquiry(int inquiryId) throws ValidationException {
        if (inquiryId <= 0) {
            throw new ValidationException("Valid Inquiry ID is required for deletion.");
        }
        return inquiryDAO.deleteInquiry(inquiryId);
    }

    /**
     * KPI Aggregate counts for the CRM Dashboard.
     */
    public int getTotalCount() {
        return inquiryDAO.getTotalInquiriesCount();
    }

    public int getCountByStatus(InquiryStatus status) {
        return inquiryDAO.getInquiriesCountByStatus(status);
    }

    /**
     * Rigorous validation rules for Customer and Event data entries.
     */
    private void validateInquiry(Inquiry inquiry) throws ValidationException {
        List<String> errors = new ArrayList<>();

        // Customer Validation
        Customer customer = inquiry.getCustomer();
        if (customer == null) {
            errors.add("Customer details are missing.");
        } else {
            if (customer.getFullName() == null || customer.getFullName().trim().length() < 3) {
                errors.add("Customer Full Name must contain at least 3 characters.");
            }
            if (customer.getEmail() == null || !EMAIL_PATTERN.matcher(customer.getEmail().trim()).matches()) {
                errors.add("A valid email address is required (e.g., name@domain.com).");
            }
            if (customer.getPhone() == null || !PHONE_PATTERN.matcher(customer.getPhone().trim()).matches()) {
                errors.add("A valid contact phone number is required (min 9 digits).");
            }
        }

        // Event Type
        if (inquiry.getEventType() == null || inquiry.getEventType().trim().isEmpty()) {
            errors.add("Event Type is required (e.g., Wedding, Corporate Dinner).");
        }

        // Event Date Validation (Must be a future date)
        if (inquiry.getEventDate() == null) {
            errors.add("Event Date is required.");
        } else {
            LocalDate today = LocalDate.now();
            LocalDate eventLocalDate = inquiry.getEventDate().toLocalDate();
            if (eventLocalDate.isBefore(today)) {
                errors.add("Event Date must be today or a future date. Past dates are not permitted.");
            }
        }

        // Guest Count
        if (inquiry.getGuestCount() < 5) {
            errors.add("Guest Count must be at least 5 guests for catering reservations.");
        }

        // Venue Location
        if (inquiry.getVenueLocation() == null || inquiry.getVenueLocation().trim().length() < 3) {
            errors.add("Venue Location is required (minimum 3 characters).");
        }

        // Budget Estimate
        if (inquiry.getBudgetEstimate() <= 0) {
            errors.add("Budget Estimate must be a positive numeric value greater than zero.");
        }

        // Channel
        if (inquiry.getCommunicationChannel() == null || inquiry.getCommunicationChannel().trim().isEmpty()) {
            errors.add("Communication Channel is required (e.g., WhatsApp, Phone, Email).");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }
}
