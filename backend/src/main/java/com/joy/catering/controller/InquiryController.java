package com.joy.catering.controller;

import com.joy.catering.ApiException;
import com.joy.catering.Mapping;
import com.joy.catering.dto.Dtos.InquiryInput;
import com.joy.catering.dto.Dtos.InquiryOut;
import com.joy.catering.dto.Dtos.InquiryReplyInput;
import com.joy.catering.model.Inquiry;
import com.joy.catering.model.User;
import com.joy.catering.repo.InquiryRepository;
import com.joy.catering.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@org.springframework.transaction.annotation.Transactional
public class InquiryController {

    private final InquiryRepository inquiryRepo;
    private final InquiryService inquiryService;

    public InquiryController(InquiryRepository inquiryRepo, InquiryService inquiryService) {
        this.inquiryRepo = inquiryRepo;
        this.inquiryService = inquiryService;
    }

    private User me(Authentication a) {
        return (User) a.getPrincipal();
    }

    // --- Customer Endpoints ---

    @PostMapping("/inquiries")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<InquiryOut> createInquiry(@Valid @RequestBody InquiryInput input, Authentication auth) {
        Inquiry inquiry = inquiryService.createInquiry(me(auth).getId(), input);
        return ResponseEntity.status(201).body(Mapping.inquiry(inquiry));
    }

    @GetMapping("/inquiries")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<InquiryOut> getMyInquiries(Authentication auth) {
        return inquiryRepo.findByCustomerIdOrderByCreatedAtDesc(me(auth).getId())
                .stream().map(Mapping::inquiry).toList();
    }

    @GetMapping("/inquiries/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public InquiryOut getMyInquiryDetail(@PathVariable Long id, Authentication auth) {
        Inquiry inquiry = inquiryRepo.findById(id)
                .filter(x -> x.getCustomer().getId().equals(me(auth).getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Inquiry not found"));
        return Mapping.inquiry(inquiry);
    }

    @PutMapping("/inquiries/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public InquiryOut updateInquiry(@PathVariable Long id, @Valid @RequestBody InquiryInput input, Authentication auth) {
        Inquiry inquiry = inquiryService.updateInquiry(id, me(auth).getId(), input);
        return Mapping.inquiry(inquiry);
    }

    @DeleteMapping("/inquiries/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Long id, Authentication auth) {
        inquiryService.deleteInquiry(id, me(auth).getId());
        return ResponseEntity.noContent().build();
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/inquiries")
    @PreAuthorize("hasAnyRole('GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR')")
    public List<InquiryOut> getAllInquiries() {
        return inquiryRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(Mapping::inquiry).toList();
    }

    @GetMapping("/admin/inquiries/{id}")
    @PreAuthorize("hasAnyRole('GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR')")
    public InquiryOut getInquiryDetail(@PathVariable Long id) {
        Inquiry inquiry = inquiryRepo.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Inquiry not found"));
        return Mapping.inquiry(inquiry);
    }

    @PutMapping("/admin/inquiries/{id}/reply")
    @PreAuthorize("hasAnyRole('GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR')")
    public InquiryOut replyInquiry(@PathVariable Long id, @Valid @RequestBody InquiryReplyInput input) {
        Inquiry inquiry = inquiryService.replyInquiry(id, input);
        return Mapping.inquiry(inquiry);
    }

    @PutMapping("/admin/inquiries/{id}/resolve")
    @PreAuthorize("hasAnyRole('GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR')")
    public InquiryOut resolveInquiry(@PathVariable Long id) {
        Inquiry inquiry = inquiryService.resolveInquiry(id);
        return Mapping.inquiry(inquiry);
    }
}
