package com.joy.catering.controller;

import com.joy.catering.model.Invoice;
import com.joy.catering.repo.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {
    
    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping
    public List<Invoice> getAll() {
        return invoiceRepository.findAll();
    }

    @PostMapping
    public Invoice create(@RequestBody Invoice invoice) {
        if (invoice.getStatus() == null) {
            invoice.setStatus("Pending Payment");
        }
        return invoiceRepository.save(invoice);
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Invoice> markPaid(@PathVariable Long id) {
        return invoiceRepository.findById(id).map(inv -> {
            inv.setStatus("Paid");
            return ResponseEntity.ok(invoiceRepository.save(inv));
        }).orElse(ResponseEntity.notFound().build());
    }
}
