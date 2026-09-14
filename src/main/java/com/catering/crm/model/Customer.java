package com.catering.crm.model;

import java.sql.Timestamp;

/**
 * Customer entity representing a corporate or individual client.
 */
public class Customer {
    private int customerId;
    private String fullName;
    private String email;
    private String phone;
    private String companyName;
    private Timestamp createdAt;

    public Customer() {}

    public Customer(int customerId, String fullName, String email, String phone, String companyName) {
        this.customerId = customerId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.companyName = companyName;
    }

    public Customer(String fullName, String email, String phone, String companyName) {
        this(0, fullName, email, phone, companyName);
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return fullName + (companyName != null && !companyName.isEmpty() ? " (" + companyName + ")" : "");
    }
}
