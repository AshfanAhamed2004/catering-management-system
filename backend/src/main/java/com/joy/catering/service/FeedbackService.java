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

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ApiException(HttpStatus.CONFLICT, "Feedback can only be submitted for APPROVED bookings");
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
        feedback.setStatus(FeedbackStatus.NEW);
        
        return feedbackRepo.save(feedback);
    }

    public Feedback editFeedback(Long feedbackId, Long customerId, FeedbackUpdate input) {
        Feedback feedback = feedbackRepo.findById(feedbackId)
                .filter(f -> f.getCustomer().getId().equals(customerId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Feedback not found"));

        if (feedback.getStatus() != FeedbackStatus.NEW) {
            throw new ApiException(HttpStatus.CONFLICT, "Only NEW feedback can be edited");
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

        if (input.status() != null) {
            feedback.setStatus(input.status());
        }
        if (input.categories() != null) {
            feedback.setCategories(input.categories());
        }
        if (input.staffResponse() != null) {
            feedback.setStaffResponse(input.staffResponse());
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
        long newCount = all.stream().filter(f -> f.getStatus() == FeedbackStatus.NEW).count();
        long inReview = all.stream().filter(f -> f.getStatus() == FeedbackStatus.IN_REVIEW).count();

        return new FeedbackReportOut(total, avg, low, dist, catDist, newCount, newCount + inReview);
    }
}
