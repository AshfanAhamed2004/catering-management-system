package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.*;
import com.joy.catering.model.*;
import com.joy.catering.repo.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepo;
    private final BookingService bookingService;

    public FeedbackService(FeedbackRepository feedbackRepo, BookingService bookingService) {
        this.feedbackRepo = feedbackRepo;
        this.bookingService = bookingService;
    }

    private void validateFeedbackData(Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Rating must be between 1 and 5");
        }
        if ((rating == 1 || rating == 2) && (comment == null || comment.trim().isEmpty())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Comment is required when rating is 1 or 2");
        }
    }

    public Feedback submitFeedback(Long bookingId, Long customerId, FeedbackInput input) {
        Booking booking = bookingService.own(bookingId, customerId);

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ApiException(HttpStatus.CONFLICT, "Feedback can only be submitted for COMPLETED bookings");
        }
        
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Colombo"));
        if (!booking.getEventDate().isBefore(today)) {
            throw new ApiException(HttpStatus.CONFLICT, "Feedback can only be submitted after the event date has passed");
        }

        if (feedbackRepo.existsByBookingId(bookingId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Feedback already exists for this booking");
        }

        validateFeedbackData(input.rating(), input.comment());

        Feedback feedback = new Feedback();
        feedback.setBooking(booking);
        feedback.setCustomer(booking.getCustomer());
        feedback.setRating(input.rating());
        feedback.setComment(input.comment());
        feedback.setCategories(input.categories() == null ? new java.util.ArrayList<>() : input.categories());
        feedback.setStatus(FeedbackStatus.SUBMITTED);
        
        return feedbackRepo.save(feedback);
    }

    public Feedback editFeedback(Long feedbackId, Long customerId, FeedbackUpdate input) {
        Feedback feedback = feedbackRepo.findById(feedbackId)
                .filter(f -> f.getCustomer().getId().equals(customerId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Feedback not found"));

        if (feedback.getStatus() != FeedbackStatus.SUBMITTED) {
            throw new ApiException(HttpStatus.CONFLICT, "Only SUBMITTED feedback can be edited");
        }

        validateFeedbackData(input.rating(), input.comment());

        feedback.setRating(input.rating());
        feedback.setComment(input.comment());
        feedback.setCategories(input.categories() == null ? new java.util.ArrayList<>() : input.categories());
        
        return feedbackRepo.save(feedback);
    }

    public Feedback updateStaffFeedback(Long feedbackId, StaffFeedbackUpdate input) {
        Feedback feedback = feedbackRepo.findById(feedbackId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Feedback not found"));

        if (input.categories() != null) {
            feedback.setCategories(input.categories());
        }

        if (input.staffResponse() != null) {
            feedback.setStaffResponse(input.staffResponse());
        }

        if (input.status() != null && input.status() != feedback.getStatus()) {
            FeedbackStatus current = feedback.getStatus();
            FeedbackStatus next = input.status();

            boolean valid = false;
            if (current == FeedbackStatus.SUBMITTED && next == FeedbackStatus.UNDER_REVIEW) valid = true;
            else if (current == FeedbackStatus.UNDER_REVIEW && next == FeedbackStatus.RESPONDED) {
                if (feedback.getStaffResponse() == null || feedback.getStaffResponse().trim().isEmpty()) {
                    throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Response text is required to mark as RESPONDED");
                }
                valid = true;
            }
            else if (current == FeedbackStatus.RESPONDED && next == FeedbackStatus.RESOLVED) valid = true;
            else if (current == FeedbackStatus.RESOLVED && next == FeedbackStatus.ARCHIVED) valid = true;

            if (!valid) {
                throw new ApiException(HttpStatus.CONFLICT, "Invalid status transition from " + current + " to " + next);
            }
            feedback.setStatus(next);
        }
        
        return feedbackRepo.save(feedback);
    }

    public FeedbackReportOut getFeedbackReport() {
        java.util.List<Feedback> all = feedbackRepo.findAll();
        long total = all.size();
        double avg = all.stream().mapToInt(Feedback::getRating).average().orElse(0.0);
        long low = all.stream().filter(f -> f.getRating() <= 2).count();
        java.util.Map<Integer, Long> dist = all.stream().collect(java.util.stream.Collectors.groupingBy(Feedback::getRating, java.util.stream.Collectors.counting()));
        java.util.Map<FeedbackCategory, Long> catDist = all.stream().flatMap(f -> f.getCategories().stream()).collect(java.util.stream.Collectors.groupingBy(c -> c, java.util.stream.Collectors.counting()));
        long submittedCount = all.stream().filter(f -> f.getStatus() == FeedbackStatus.SUBMITTED).count();
        long underReviewCount = all.stream().filter(f -> f.getStatus() == FeedbackStatus.UNDER_REVIEW).count();

        java.util.Map<String, Double> monthlyAvg = new java.util.LinkedHashMap<>();
        java.util.Map<String, Long> monthlyCount = new java.util.LinkedHashMap<>();
        java.util.Map<String, Long> monthlySum = new java.util.HashMap<>();
        
        java.time.YearMonth currentMonth = java.time.YearMonth.now(java.time.ZoneOffset.UTC);
        for (int i = 5; i >= 0; i--) {
            String ym = currentMonth.minusMonths(i).toString();
            monthlyAvg.put(ym, 0.0);
            monthlyCount.put(ym, 0L);
            monthlySum.put(ym, 0L);
        }

        for (Feedback f : all) {
            if (f.getCreatedAt() != null) {
                String ym = java.time.YearMonth.from(f.getCreatedAt().withOffsetSameInstant(java.time.ZoneOffset.UTC)).toString();
                if (monthlyCount.containsKey(ym)) {
                    monthlyCount.put(ym, monthlyCount.get(ym) + 1);
                    monthlySum.put(ym, monthlySum.get(ym) + f.getRating());
                }
            }
        }

        for (String ym : monthlyCount.keySet()) {
            long count = monthlyCount.get(ym);
            if (count > 0) {
                monthlyAvg.put(ym, (double) monthlySum.get(ym) / count);
            }
        }

        return new FeedbackReportOut(total, avg, low, dist, catDist, submittedCount, submittedCount + underReviewCount, monthlyAvg, monthlyCount);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        String sanitized = value.trim();
        if (sanitized.startsWith("=") || sanitized.startsWith("+") || sanitized.startsWith("-") || sanitized.startsWith("@")) {
            sanitized = "'" + sanitized;
        }
        if (sanitized.contains("\"") || sanitized.contains(",") || sanitized.contains("\n") || sanitized.contains("\r")) {
            sanitized = "\"" + sanitized.replace("\"", "\"\"") + "\"";
        }
        return sanitized;
    }

    public String exportFeedbackCsv(org.springframework.data.jpa.domain.Specification<Feedback> spec, org.springframework.data.domain.Sort sort) {
        java.util.List<Feedback> feedbacks = feedbackRepo.findAll(spec, sort);
        StringBuilder sb = new StringBuilder();
        
        // Header
        sb.append("Booking Reference,Submitted Date,Customer Name,Customer Email,Rating,Categories,Status,Customer Comment,Staff Response\n");
        
        // Data
        for (Feedback f : feedbacks) {
            String ref = f.getBooking() != null ? f.getBooking().getReference() : "";
            String date = f.getCreatedAt() != null ? f.getCreatedAt().toString() : "";
            String name = "";
            String email = "";
            if (f.getCustomer() != null) {
                email = f.getCustomer().getEmail();
                if (f.getCustomer().getProfile() != null) {
                    name = f.getCustomer().getProfile().getFullName();
                }
            }
            String cats = f.getCategories() != null ? f.getCategories().stream().map(Enum::name).collect(java.util.stream.Collectors.joining("; ")) : "";
            
            sb.append(escapeCsv(ref)).append(",");
            sb.append(escapeCsv(date)).append(",");
            sb.append(escapeCsv(name)).append(",");
            sb.append(escapeCsv(email)).append(",");
            sb.append(f.getRating()).append(",");
            sb.append(escapeCsv(cats)).append(",");
            sb.append(escapeCsv(f.getStatus() != null ? f.getStatus().name() : "")).append(",");
            sb.append(escapeCsv(f.getComment())).append(",");
            sb.append(escapeCsv(f.getStaffResponse())).append("\n");
        }
        
        return sb.toString();
    }
}
