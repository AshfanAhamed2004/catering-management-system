package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.WasteInput;
import com.joy.catering.model.*;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.UserRepository;
import com.joy.catering.repo.WasteRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WasteServiceTest {

    @Mock
    private WasteRecordRepository wasteRepo;

    @Mock
    private BookingRepository bookingRepo;

    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private WasteService wasteService;

    private User authUser;
    private Booking booking;

    @BeforeEach
    void setUp() {
        authUser = new User();
        authUser.setId(1L);
        authUser.setEmail("chef@test.com");
        authUser.setRole(Role.HEAD_CHEF);
        authUser.setActive(true);

        booking = new Booking();
        booking.setId(10L);
        booking.setStatus(BookingStatus.APPROVED);
    }

    @Test
    void createWaste_success() {
        when(userRepo.findByEmail("chef@test.com")).thenReturn(Optional.of(authUser));
        when(wasteRepo.save(any(WasteRecord.class))).thenAnswer(i -> i.getArguments()[0]);

        WasteInput input = new WasteInput("Tomatoes ", new BigDecimal("5.5"), "kg", WasteCategory.SPOILAGE, LocalDate.now(), null, "Test notes");
        WasteRecord res = wasteService.createWaste(input, "chef@test.com");

        assertNotNull(res);
        assertEquals("Tomatoes", res.getIngredientName()); // Checks normalization
        assertEquals(new BigDecimal("5.5"), res.getQuantity());
        assertEquals("kg", res.getUnit());
        assertEquals(WasteCategory.SPOILAGE, res.getCategory());
        assertNull(res.getBooking());
        assertEquals(authUser, res.getRecordedBy());
    }

    @Test
    void createWaste_failsIfQuantityZero() {
        WasteInput input = new WasteInput("Tomatoes", BigDecimal.ZERO, "kg", WasteCategory.SPOILAGE, LocalDate.now(), null, "");
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.createWaste(input, "chef@test.com"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createWaste_failsIfQuantityNegative() {
        WasteInput input = new WasteInput("Tomatoes", new BigDecimal("-1.0"), "kg", WasteCategory.SPOILAGE, LocalDate.now(), null, "");
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.createWaste(input, "chef@test.com"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createWaste_failsIfIngredientBlank() {
        WasteInput input = new WasteInput("   ", new BigDecimal("1.0"), "kg", WasteCategory.SPOILAGE, LocalDate.now(), null, "");
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.createWaste(input, "chef@test.com"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createWaste_failsIfFutureDate() {
        WasteInput input = new WasteInput("Tomatoes", new BigDecimal("1.0"), "kg", WasteCategory.SPOILAGE, LocalDate.now().plusDays(1), null, "");
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.createWaste(input, "chef@test.com"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createWaste_failsIfBookingCancelled() {
        when(userRepo.findByEmail("chef@test.com")).thenReturn(Optional.of(authUser));
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepo.findById(10L)).thenReturn(Optional.of(booking));

        WasteInput input = new WasteInput("Tomatoes", new BigDecimal("1.0"), "kg", WasteCategory.SPOILAGE, LocalDate.now(), 10L, "");
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.createWaste(input, "chef@test.com"));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void createWaste_failsIfBookingRejected() {
        when(userRepo.findByEmail("chef@test.com")).thenReturn(Optional.of(authUser));
        booking.setStatus(BookingStatus.REJECTED);
        when(bookingRepo.findById(10L)).thenReturn(Optional.of(booking));

        WasteInput input = new WasteInput("Tomatoes", new BigDecimal("1.0"), "kg", WasteCategory.SPOILAGE, LocalDate.now(), 10L, "");
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.createWaste(input, "chef@test.com"));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void createWaste_failsIfInactiveUser() {
        authUser.setActive(false);
        when(userRepo.findByEmail("chef@test.com")).thenReturn(Optional.of(authUser));

        WasteInput input = new WasteInput("Tomatoes", new BigDecimal("1.0"), "kg", WasteCategory.SPOILAGE, LocalDate.now(), null, "");
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.createWaste(input, "chef@test.com"));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void createWaste_failsIfCustomerUser() {
        authUser.setRole(Role.CUSTOMER);
        when(userRepo.findByEmail("chef@test.com")).thenReturn(Optional.of(authUser));

        WasteInput input = new WasteInput("Tomatoes", new BigDecimal("1.0"), "kg", WasteCategory.SPOILAGE, LocalDate.now(), null, "");
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.createWaste(input, "chef@test.com"));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void updateWaste_success() {
        WasteRecord record = new WasteRecord();
        record.setId(100L);
        record.setIngredientName("Old");
        when(wasteRepo.findById(100L)).thenReturn(Optional.of(record));
        when(wasteRepo.save(any(WasteRecord.class))).thenAnswer(i -> i.getArguments()[0]);

        WasteInput update = new WasteInput("New Tomato ", new BigDecimal("2.0"), "kg", WasteCategory.OTHER, LocalDate.now(), null, "Updated");
        WasteRecord res = wasteService.updateWaste(100L, update);

        assertEquals("New tomato", res.getIngredientName()); // Checks normalization
        assertEquals(new BigDecimal("2.0"), res.getQuantity());
        assertEquals("Updated", res.getNotes());
    }

    @Test
    void deleteWaste_success() {
        WasteRecord record = new WasteRecord();
        record.setId(100L);
        when(wasteRepo.findById(100L)).thenReturn(Optional.of(record));

        wasteService.deleteWaste(100L);
        verify(wasteRepo).delete(record);
    }

    @Test
    void getWaste_success() {
        WasteRecord record = new WasteRecord();
        record.setId(100L);
        when(wasteRepo.findById(100L)).thenReturn(Optional.of(record));

        WasteRecord res = wasteService.getWaste(100L);
        assertNotNull(res);
    }

    @Test
    void missingRecordHandled() {
        when(wasteRepo.findById(100L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> wasteService.getWaste(100L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void summaryAggregation() {
        when(wasteRepo.getTotalWasteQuantity()).thenReturn(new BigDecimal("10.5"));
        java.util.List<Object[]> byIng = new java.util.ArrayList<>();
        byIng.add(new Object[]{"Tomato", new BigDecimal("10.5")});
        when(wasteRepo.getWasteQuantityByIngredient()).thenReturn(byIng);
        
        java.util.List<Object[]> byCat = new java.util.ArrayList<>();
        byCat.add(new Object[]{WasteCategory.SPOILAGE, new BigDecimal("10.5")});
        when(wasteRepo.getWasteQuantityByCategory()).thenReturn(byCat);
        
        var summary = wasteService.getSummary();
        assertEquals(new BigDecimal("10.5"), summary.totalQuantity());
        assertEquals(new BigDecimal("10.5"), summary.byIngredient().get("Tomato"));
        assertEquals(new BigDecimal("10.5"), summary.byCategory().get("SPOILAGE"));
    }
}
