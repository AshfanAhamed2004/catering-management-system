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
        f.setStatus(FeedbackStatus.SUBMITTED);

        when(feedbackRepo.findById(50L)).thenReturn(Optional.of(f));
        when(feedbackRepo.save(any())).thenReturn(f);

        StaffFeedbackUpdate update = new StaffFeedbackUpdate(FeedbackStatus.UNDER_REVIEW, null, null);
        Feedback updated = feedbackService.updateStaffFeedback(50L, update);

        assertEquals(FeedbackStatus.UNDER_REVIEW, updated.getStatus());
    }

    @Test
    void updateStaffFeedback_failsIfRespondedWithoutText() {
        Feedback f = new Feedback();
        f.setId(50L);
        f.setStatus(FeedbackStatus.UNDER_REVIEW);

        when(feedbackRepo.findById(50L)).thenReturn(Optional.of(f));

        StaffFeedbackUpdate update = new StaffFeedbackUpdate(FeedbackStatus.RESPONDED, null, "   ");
        ApiException ex = assertThrows(ApiException.class, () -> feedbackService.updateStaffFeedback(50L, update));
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatus());
    }

    @Test
    void updateStaffFeedback_failsIfInvalidTransition() {
        Feedback f = new Feedback();
        f.setId(50L);
        f.setStatus(FeedbackStatus.SUBMITTED);

        when(feedbackRepo.findById(50L)).thenReturn(Optional.of(f));

        StaffFeedbackUpdate update = new StaffFeedbackUpdate(FeedbackStatus.RESOLVED, null, null);
        ApiException ex = assertThrows(ApiException.class, () -> feedbackService.updateStaffFeedback(50L, update));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void editFeedback_failsIfUnderReview() {
        Feedback f = new Feedback();
        f.setId(50L);
        f.setCustomer(customer);
        f.setStatus(FeedbackStatus.UNDER_REVIEW);
        
        when(feedbackRepo.findById(50L)).thenReturn(Optional.of(f));
        FeedbackUpdate update = new FeedbackUpdate(5, "Updated", null);
        ApiException ex = assertThrows(ApiException.class, () -> feedbackService.editFeedback(50L, 1L, update));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void getFeedbackReport_calculatesCorrectly() {
        Feedback f1 = new Feedback(); f1.setRating(5); f1.setStatus(FeedbackStatus.SUBMITTED); f1.setCategories(List.of(FeedbackCategory.FOOD_QUALITY));
        Feedback f2 = new Feedback(); f2.setRating(2); f2.setStatus(FeedbackStatus.UNDER_REVIEW); f2.setCategories(List.of(FeedbackCategory.SERVICE));
        Feedback f3 = new Feedback(); f3.setRating(2); f3.setStatus(FeedbackStatus.RESOLVED); f3.setCategories(List.of(FeedbackCategory.FOOD_QUALITY));

        when(feedbackRepo.findAll()).thenReturn(List.of(f1, f2, f3));

        FeedbackReportOut report = feedbackService.getFeedbackReport();
        assertEquals(3, report.totalFeedback());
        assertEquals(3.0, report.averageRating());
        assertEquals(2, report.lowRatingCount());
        assertEquals(1, report.submittedFeedbackCount());
        assertEquals(2, report.unresolvedFeedbackCount()); // 1 SUBMITTED + 1 UNDER_REVIEW
        assertEquals(2, report.categoryBreakdown().get(FeedbackCategory.FOOD_QUALITY));
        assertEquals(1, report.categoryBreakdown().get(FeedbackCategory.SERVICE));
        assertEquals(2, report.ratingDistribution().get(2));
        assertEquals(1, report.ratingDistribution().get(5));
    }

    @Test
    void exportFeedbackCsv_generatesCorrectly() {
        Feedback f = new Feedback();
        f.setId(1L);
        Booking b = new Booking();
        b.setReference("B-123");
        f.setBooking(b);
        User u = new User();
        u.setEmail("test@test.com");
        CustomerProfile p = new CustomerProfile();
        p.setFullName("John Doe");
        u.setProfile(p);
        f.setCustomer(u);
        f.setRating(5);
        f.setCategories(List.of(FeedbackCategory.FOOD_QUALITY));
        f.setStatus(FeedbackStatus.SUBMITTED);
        f.setComment("Great, really \"good\"\nNewline");
        f.setStaffResponse("=SUM(A1)");

        when(feedbackRepo.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Sort.class))).thenReturn(List.of(f));

        org.springframework.data.jpa.domain.Specification<Feedback> dummySpec = (root, query, cb) -> cb.conjunction();
        org.springframework.data.domain.Sort dummySort = org.springframework.data.domain.Sort.unsorted();
        
        String csv = feedbackService.exportFeedbackCsv(dummySpec, dummySort);
        assertNotNull(csv);
        assertTrue(csv.startsWith("Booking Reference,Submitted Date,Customer Name,Customer Email,Rating,Categories,Status,Customer Comment,Staff Response\n"));
        assertTrue(csv.contains("B-123"));
        assertTrue(csv.contains("John Doe"));
        assertTrue(csv.contains("test@test.com"));
        assertTrue(csv.contains("5"));
        assertTrue(csv.contains("FOOD_QUALITY"));
        assertTrue(csv.contains("SUBMITTED"));
        assertTrue(csv.contains("\"Great, really \"\"good\"\"\nNewline\"")); // CSV escaped
        assertTrue(csv.contains("'=SUM(A1)")); // Sanitized injection
    }
}
