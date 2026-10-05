package com.joy.catering.controller;

import com.joy.catering.dto.Dtos.CustomerSummaryOut;
import com.joy.catering.dto.Dtos.CustomerBookingHistoryOut;
import com.joy.catering.dto.Dtos.CustomerFeedbackHistoryOut;
import com.joy.catering.service.CustomerManagementService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/staff/customers")
@PreAuthorize("hasAnyRole('CUSTOMER_SERVICE_SUPERVISOR', 'GENERAL_MANAGER')")
public class CustomerManagementController {

    private final CustomerManagementService service;

    public CustomerManagementController(CustomerManagementService service) {
        this.service = service;
    }

    @PostMapping("/{customerId}/toggle-active")
    public com.joy.catering.dto.Dtos.Customer360Out toggleActive(@PathVariable Long customerId) {
        return service.toggleCustomerActive(customerId);
    }

    @GetMapping
    public List<CustomerSummaryOut> getCustomers(@RequestParam(required = false) String search) {
        return service.searchCustomers(search);
    }

    @GetMapping("/{customerId}")
    public com.joy.catering.dto.Dtos.Customer360Out getCustomer360(@PathVariable Long customerId) {
        return service.getCustomer360(customerId);
    }

    @GetMapping("/{customerId}/bookings")
    public List<CustomerBookingHistoryOut> getCustomerBookings(@PathVariable Long customerId) {
        return service.getCustomerBookings(customerId);
    }

    @GetMapping("/{customerId}/feedback")
    public List<CustomerFeedbackHistoryOut> getCustomerFeedback(@PathVariable Long customerId) {
        return service.getCustomerFeedback(customerId);
    }

    @GetMapping("/{customerId}/invoices")
    public List<com.joy.catering.dto.Dtos.CustomerInvoiceHistoryOut> getCustomerInvoices(@PathVariable Long customerId) {
        return service.getCustomerInvoices(customerId);
    }
}