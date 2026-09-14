package com.joy.catering.controller;

import com.joy.catering.Mapping;
import com.joy.catering.dto.Dtos.*;
import com.joy.catering.model.*;
import com.joy.catering.repo.FeedbackRepository;
import com.joy.catering.service.FeedbackService;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
public class FeedbackController {

    private final FeedbackRepository feedbackRepo;
    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackRepository feedbackRepo, FeedbackService feedbackService) {
        this.feedbackRepo = feedbackRepo;
        this.feedbackService = feedbackService;
    }

    private User me(Authentication a) {
        return (User) a.getPrincipal();
    }

    // --- Customer Endpoints ---

    @PostMapping("/bookings/{bookingId}/feedback")
    public ResponseEntity<FeedbackOut> submitFeedback(
            @PathVariable Long bookingId,
            @Valid @RequestBody FeedbackInput input,
            Authentication auth) {
        Feedback f = feedbackService.submitFeedback(bookingId, me(auth).getId(), input);
        return ResponseEntity.status(201).body(Mapping.feedback(f));
    }

    @GetMapping("/feedback")
    public List<FeedbackOut> getMyFeedback(Authentication auth) {
        return feedbackRepo.findByCustomerIdOrderByCreatedAtDescIdDesc(me(auth).getId())
                .stream().map(Mapping::feedback).toList();
    }

    @GetMapping("/feedback/{id}")
    public FeedbackOut getMyFeedbackDetail(@PathVariable Long id, Authentication auth) {
        Feedback f = feedbackRepo.findById(id)
                .filter(x -> x.getCustomer().getId().equals(me(auth).getId()))
                .orElseThrow(() -> new com.joy.catering.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Feedback not found"));
        return Mapping.feedback(f);
    }

    @PutMapping("/feedback/{id}")
    public FeedbackOut editFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackUpdate input,
            Authentication auth) {
        Feedback f = feedbackService.editFeedback(id, me(auth).getId(), input);
        return Mapping.feedback(f);
    }

    // --- Staff Endpoints ---

    private Specification<Feedback> buildSpecification(FeedbackStatus status, Integer rating, FeedbackCategory category, LocalDate fromDate, LocalDate toDate, String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (rating != null) predicates.add(cb.equal(root.get("rating"), rating));
            if (category != null) {
                predicates.add(cb.isMember(category, root.get("categories")));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay(java.time.ZoneOffset.UTC).toOffsetDateTime()));
            }
            if (toDate != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), toDate.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toOffsetDateTime()));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate matchRef = cb.like(cb.lower(root.join("booking", jakarta.persistence.criteria.JoinType.LEFT).get("reference")), pattern);
                jakarta.persistence.criteria.Join<Object, Object> customerJoin = root.join("customer", jakarta.persistence.criteria.JoinType.LEFT);
                Predicate matchEmail = cb.like(cb.lower(customerJoin.get("email")), pattern);
                jakarta.persistence.criteria.Join<Object, Object> profileJoin = customerJoin.join("profile", jakarta.persistence.criteria.JoinType.LEFT);
                Predicate matchName = cb.like(cb.lower(profileJoin.get("fullName")), pattern);
                predicates.add(cb.or(matchRef, matchEmail, matchName));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @GetMapping("/staff/feedback")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER','ADMIN')")
    public List<StaffFeedbackOut> searchFeedback(
            @RequestParam(required = false) FeedbackStatus status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) FeedbackCategory category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String search) {

        Specification<Feedback> spec = buildSpecification(status, rating, category, fromDate, toDate, search);
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt", "id");
        return feedbackRepo.findAll(spec, sort).stream().map(Mapping::staffFeedback).toList();
    }

    @GetMapping(value = "/staff/feedback/export", produces = "text/csv")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER','ADMIN')")
    public ResponseEntity<String> exportFeedback(
            @RequestParam(required = false) FeedbackStatus status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) FeedbackCategory category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String search) {

        Specification<Feedback> spec = buildSpecification(status, rating, category, fromDate, toDate, search);
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt", "id");
        String csv = feedbackService.exportFeedbackCsv(spec, sort);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"feedback_report.csv\"")
                .body(csv);
    }

    @GetMapping("/staff/feedback/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER','ADMIN')")
    public StaffFeedbackOut getStaffFeedbackDetail(@PathVariable Long id) {
        Feedback f = feedbackRepo.findById(id)
                .orElseThrow(() -> new com.joy.catering.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Feedback not found"));
        return Mapping.staffFeedback(f);
    }

    @PutMapping("/staff/feedback/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER','ADMIN')")
    public StaffFeedbackOut updateStaffFeedback(
            @PathVariable Long id,
            @Valid @RequestBody StaffFeedbackUpdate input) {
        Feedback f = feedbackService.updateStaffFeedback(id, input);
        return Mapping.staffFeedback(f);
    }

    @GetMapping("/staff/feedback/report")
    @PreAuthorize("hasAnyRole('CUSTOMER_RELATIONS_OFFICER','ADMIN')")
    public FeedbackReportOut getFeedbackReport() {
        return feedbackService.getFeedbackReport();
    }
}
