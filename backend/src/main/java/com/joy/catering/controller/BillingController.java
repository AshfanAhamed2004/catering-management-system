package com.joy.catering.controller;

import com.joy.catering.Mapping;
import com.joy.catering.dto.Dtos.BillingInvoiceOut;
import com.joy.catering.dto.Dtos.BillingMetricsOut;
import com.joy.catering.model.Invoice;
import com.joy.catering.repo.InvoiceRepository;
import com.joy.catering.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.model.BookingStatus;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/billing")
@PreAuthorize("hasAnyRole('FINANCE_OFFICER', 'GENERAL_MANAGER')")
public class BillingController {
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private BillingService billingService;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<BillingInvoiceOut> getAll() {
        return invoiceRepository.findAll().stream().map(Mapping::billingInvoice).collect(Collectors.toList());
    }

    @GetMapping("/metrics")
    public BillingMetricsOut getMetrics() {
        return billingService.getBillingMetrics();
    }

    @PostMapping
    public BillingInvoiceOut create(@RequestBody Invoice invoice) {
        if (invoice.getStatus() == null) {
            invoice.setStatus("Pending Payment");
        }
        return Mapping.billingInvoice(invoiceRepository.save(invoice));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<BillingInvoiceOut> markPaid(@PathVariable Long id) {
        return invoiceRepository.findById(id).map(inv -> {
            inv.setStatus("Paid");
            return ResponseEntity.ok(Mapping.billingInvoice(invoiceRepository.save(inv)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillingInvoiceOut> update(@PathVariable Long id, @RequestBody Invoice details) {
        return invoiceRepository.findById(id).map(inv -> {
            inv.setAmount(details.getAmount());
            inv.setStatus(details.getStatus());
            if (details.getClientName() != null) inv.setClientName(details.getClientName());
            if (details.getEventName() != null) inv.setEventName(details.getEventName());
            return ResponseEntity.ok(Mapping.billingInvoice(invoiceRepository.save(inv)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return invoiceRepository.findById(id).map(inv -> {
            invoiceRepository.delete(inv);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}