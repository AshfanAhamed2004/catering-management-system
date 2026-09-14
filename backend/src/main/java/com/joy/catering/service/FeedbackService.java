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

        return new FeedbackReportOut(total, avg, low, dist, catDist, submittedCount, submittedCount + underReviewCount);
    }
}
