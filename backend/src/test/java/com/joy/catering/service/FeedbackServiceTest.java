package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.*;
import com.joy.catering.model.*;
import com.joy.catering.repo.FeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepo;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private FeedbackService feedbackService;

    private User customer;
    private Booking booking;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId(1L);

        booking = new Booking();
        booking.setId(10L);
        booking.setCustomer(customer);
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setEventDate(LocalDate.now().minusDays(1)); // Past event
    }

    @Test
    void submitFeedback_success() {
        when(bookingService.own(10L, 1L)).thenReturn(booking);
        when(feedbackRepo.existsByBookingId(10L)).thenReturn(false);
        
        Feedback savedMock = new Feedback();
        savedMock.setId(100L);
        when(feedbackRepo.save(any())).thenReturn(savedMock);

        FeedbackInput input = new FeedbackInput(5, "Great!", List.of(FeedbackCategory.FOOD_QUALITY));
        Feedback result = feedbackService.submitFeedback(10L, 1L, input);

        assertNotNull(result);
        verify(feedbackRepo, times(1)).save(any(Feedback.class));
    }

    @Test
    void submitFeedback_failsIfNotCompleted() {
        booking.setStatus(BookingStatus.PENDING);
        when(bookingService.own(10L, 1L)).thenReturn(booking);

        FeedbackInput input = new FeedbackInput(5, "Great!", null);
        ApiException ex = assertThrows(ApiException.class, () -> feedbackService.submitFeedback(10L, 1L, input));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void submitFeedback_failsIfEventInFuture() {
        booking.setEventDate(LocalDate.now().plusDays(1));
        when(bookingService.own(10L, 1L)).thenReturn(booking);

        FeedbackInput input = new FeedbackInput(5, "Great!", null);
        ApiException ex = assertThrows(ApiException.class, () -> feedbackService.submitFeedback(10L, 1L, input));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void submitFeedback_failsIfDuplicate() {
        when(bookingService.own(10L, 1L)).thenReturn(booking);
        when(feedbackRepo.existsByBookingId(10L)).thenReturn(true);

        FeedbackInput input = new FeedbackInput(5, "Great!", null);
        ApiException ex = assertThrows(ApiException.class, () -> feedbackService.submitFeedback(10L, 1L, input));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void submitFeedback_validationFailsForLowRatingWithoutComment() {
        when(bookingService.own(10L, 1L)).thenReturn(booking);
        when(feedbackRepo.existsByBookingId(10L)).thenReturn(false);

        FeedbackInput input = new FeedbackInput(2, "   ", null);
        ApiException ex = assertThrows(ApiException.class, () -> feedbackService.submitFeedback(10L, 1L, input));
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatus());
    }

    @Test
    void updateStaffFeedback_success() {
        Feedback f = new Feedback();
        f.setId(50L);
        f.setStatus(FeedbackStatus.NEW);

        when(feedbackRepo.findById(50L)).thenReturn(Optional.of(f));
        when(feedbackRepo.save(any())).thenReturn(f);

        StaffFeedbackUpdate update = new StaffFeedbackUpdate(FeedbackStatus.IN_REVIEW, null, "We are looking into this");
        Feedback updated = feedbackService.updateStaffFeedback(50L, update);

        assertEquals(FeedbackStatus.IN_REVIEW, updated.getStatus());
        assertEquals("We are looking into this", updated.getStaffResponse());
    }

    @Test
    void getFeedbackReport_calculatesCorrectly() {
        Feedback f1 = new Feedback(); f1.setRating(5); f1.setStatus(FeedbackStatus.NEW); f1.setCategories(List.of(FeedbackCategory.FOOD_QUALITY));
        Feedback f2 = new Feedback(); f2.setRating(2); f2.setStatus(FeedbackStatus.IN_REVIEW); f2.setCategories(List.of(FeedbackCategory.SERVICE));
        Feedback f3 = new Feedback(); f3.setRating(2); f3.setStatus(FeedbackStatus.RESOLVED); f3.setCategories(List.of(FeedbackCategory.FOOD_QUALITY));

        when(feedbackRepo.findAll()).thenReturn(List.of(f1, f2, f3));

        FeedbackReportOut report = feedbackService.getFeedbackReport();
        assertEquals(3, report.totalFeedback());
        assertEquals(3.0, report.averageRating());
        assertEquals(2, report.lowRatingCount());
        assertEquals(1, report.newFeedbackCount());
        assertEquals(2, report.unresolvedFeedbackCount()); // 1 NEW + 1 IN_REVIEW
        assertEquals(2, report.categoryBreakdown().get(FeedbackCategory.FOOD_QUALITY));
        assertEquals(1, report.categoryBreakdown().get(FeedbackCategory.SERVICE));
        assertEquals(2, report.ratingDistribution().get(2));
        assertEquals(1, report.ratingDistribution().get(5));
    }
}
