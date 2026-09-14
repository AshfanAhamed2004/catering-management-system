package com.catering.crm.dao;

import com.catering.crm.model.Customer;
import com.catering.crm.model.Inquiry;
import com.catering.crm.model.InquiryStatus;

import java.util.List;

/**
 * Data Access Object (DAO) Interface for Inquiry & Customer entities.
 * Defines the contract for persistence operations.
 */
public interface InquiryDAO {
    // CRUD Operations for Inquiries
    boolean createInquiry(Inquiry inquiry);
    Inquiry getInquiryById(int id);
    List<Inquiry> getAllInquiries();
    List<Inquiry> searchAndFilterInquiries(String query, String status, String channel);
    boolean updateInquiry(Inquiry inquiry);
    boolean updateInquiryStatus(int inquiryId, InquiryStatus status);
    boolean deleteInquiry(int inquiryId);

    // Customer operations
    int getOrCreateCustomerId(Customer customer);
    Customer getCustomerById(int customerId);
    List<Customer> getAllCustomers();

    // Aggregates for Dashboard KPIs
    int getTotalInquiriesCount();
    int getInquiriesCountByStatus(InquiryStatus status);
}
