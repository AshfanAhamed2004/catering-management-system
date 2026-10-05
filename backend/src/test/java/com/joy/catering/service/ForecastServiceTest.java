package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.controller.ForecastController;
import com.joy.catering.dto.Dtos.ForecastItemOut;
import com.joy.catering.dto.Dtos.ForecastOut;
import com.joy.catering.model.*;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.IngredientRequirementRepository;
import com.joy.catering.repo.PackageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ForecastServiceTest {

    @Mock
    private BookingRepository bookingRepo;

    @Mock
    private PackageRepository packageRepo;

    @Mock
    private IngredientRequirementRepository reqRepo;

    @InjectMocks
    private ForecastService forecastService;

    private Booking booking;
    private PackageEntity pack;
    private MenuItem item1;
    private MenuItem item2;

    @BeforeEach
    void setUp() {
        pack = new PackageEntity();
        pack.setId(10L);
        pack.setName("Test Package");

        item1 = new MenuItem();
        item1.setId(1L);
        item1.setName("Roast Beef");

        item2 = new MenuItem();
        item2.setId(2L);
        item2.setName("Beef Salad");

        pack.setMenuItems(Arrays.asList(item1, item2));

        booking = new Booking();
        booking.setId(100L);
        booking.setReference("CAT-TEST");
        booking.setPackageEntity(pack);
        booking.setPackageName("Test Package");
        booking.setEventDate(LocalDate.now().plusDays(5));
        booking.setGuestCount(100);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setMenuSnapshot(Arrays.asList("Old Item"));
    }

    // --- Existing Step 16D Tests ---

    @Test
    void testValidBookingForecast_CalculatesAndAggregates() {
        IngredientRequirement req1 = new IngredientRequirement();
        req1.setIngredientName("Beef");
        req1.setUnit("kg");
        req1.setQuantityPerGuest(new BigDecimal("0.25"));

        IngredientRequirement req2 = new IngredientRequirement();
        req2.setIngredientName("Beef");
        req2.setUnit("kg");
        req2.setQuantityPerGuest(new BigDecimal("0.15"));

        IngredientRequirement req3 = new IngredientRequirement();
        req3.setIngredientName("Salt");
        req3.setUnit("g");
        req3.setQuantityPerGuest(new BigDecimal("5.0"));

        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        when(reqRepo.findByMenuItemIdOrderByIngredientNameAsc(1L)).thenReturn(Arrays.asList(req1, req3));
        when(reqRepo.findByMenuItemIdOrderByIngredientNameAsc(2L)).thenReturn(Collections.singletonList(req2));

        ForecastOut result = forecastService.getBookingForecast(100L);

        assertEquals(100L, result.bookingId());
        assertEquals(2, result.items().size());
    }

    @Test
    void testDifferentUnitsRemainSeparate() {
        IngredientRequirement req1 = new IngredientRequirement();
        req1.setIngredientName("Tomato");
        req1.setUnit("kg");
        req1.setQuantityPerGuest(new BigDecimal("0.1"));

        IngredientRequirement req2 = new IngredientRequirement();
        req2.setIngredientName("Tomato");
        req2.setUnit("g");
        req2.setQuantityPerGuest(new BigDecimal("100.0"));

        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        when(reqRepo.findByMenuItemIdOrderByIngredientNameAsc(1L)).thenReturn(Collections.singletonList(req1));
        when(reqRepo.findByMenuItemIdOrderByIngredientNameAsc(2L)).thenReturn(Collections.singletonList(req2));

        ForecastOut result = forecastService.getBookingForecast(100L);
        assertEquals(2, result.items().size());
    }

    @Test
    void testBookingNotFound() {
        when(bookingRepo.findById(99L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getBookingForecast(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void testBookingWithoutPackage() {
        booking.setPackageEntity(null);
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getBookingForecast(100L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void testZeroGuestCount() {
        booking.setGuestCount(0);
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getBookingForecast(100L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void testNegativeGuestCount() {
        booking.setGuestCount(-10);
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getBookingForecast(100L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void testCancelledBookingRejected() {
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getBookingForecast(100L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void testRejectedBookingRejected() {
        booking.setStatus(BookingStatus.REJECTED);
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getBookingForecast(100L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void testMenuItemWithNoRequirementsBehavesSafely() {
        when(bookingRepo.findById(100L)).thenReturn(Optional.of(booking));
        when(reqRepo.findByMenuItemIdOrderByIngredientNameAsc(anyLong())).thenReturn(Collections.emptyList());

        ForecastOut result = forecastService.getBookingForecast(100L);
        assertTrue(result.items().isEmpty());
    }

    // --- New Step 16E Custom Forecast Tests ---

    @Test
    void testCustomForecast_CalculatesAndAggregates() {
        IngredientRequirement req1 = new IngredientRequirement();
        req1.setIngredientName("Beef");
        req1.setUnit("kg");
        req1.setQuantityPerGuest(new BigDecimal("0.25"));

        IngredientRequirement req2 = new IngredientRequirement();
        req2.setIngredientName("Beef");
        req2.setUnit("kg");
        req2.setQuantityPerGuest(new BigDecimal("0.15"));

        when(packageRepo.findById(10L)).thenReturn(Optional.of(pack));
        when(reqRepo.findByMenuItemIdOrderByIngredientNameAsc(1L)).thenReturn(Collections.singletonList(req1));
        when(reqRepo.findByMenuItemIdOrderByIngredientNameAsc(2L)).thenReturn(Collections.singletonList(req2));

        ForecastOut result = forecastService.getCustomForecast(10L, 100);

        assertNull(result.bookingId());
        assertNull(result.bookingReference());
        assertNull(result.eventDate());
        assertEquals(10L, result.packageId());
        assertEquals(100, result.guestCount());

        assertEquals(1, result.items().size());
        ForecastItemOut beefItem = result.items().get(0);
        assertEquals(new BigDecimal("0.40"), beefItem.quantityPerGuestTotal());
        assertEquals(new BigDecimal("40.00"), beefItem.requiredQuantity());
        assertTrue(beefItem.contributingMenuItems().contains("Roast Beef"));
        assertTrue(beefItem.contributingMenuItems().contains("Beef Salad"));
    }

    @Test
    void testCustomForecast_PackageNotFound() {
        when(packageRepo.findById(99L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getCustomForecast(99L, 100));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void testCustomForecast_ZeroGuestCount() {
        when(packageRepo.findById(10L)).thenReturn(Optional.of(pack));
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getCustomForecast(10L, 0));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void testCustomForecast_NegativeGuestCount() {
        when(packageRepo.findById(10L)).thenReturn(Optional.of(pack));
        ApiException ex = assertThrows(ApiException.class, () -> forecastService.getCustomForecast(10L, -5));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void testCustomForecast_EmptyRequirements() {
        when(packageRepo.findById(10L)).thenReturn(Optional.of(pack));
        when(reqRepo.findByMenuItemIdOrderByIngredientNameAsc(anyLong())).thenReturn(Collections.emptyList());

        ForecastOut result = forecastService.getCustomForecast(10L, 50);
        assertTrue(result.items().isEmpty());
    }

    @Test
    void verifyControllerAuthorization() {
        PreAuthorize auth = ForecastController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(auth, "Controller must be secured with @PreAuthorize");
        String expr = auth.value().replace(" ", "");
        assertTrue(expr.contains("hasAnyRole("));
        assertTrue(expr.contains("'HEAD_CHEF'"));
        assertTrue(expr.contains("'GENERAL_MANAGER'"));
        assertFalse(expr.contains("'CUSTOMER'"));
        assertFalse(expr.contains("'FINANCE_OFFICER'"));
        assertFalse(expr.contains("'CUSTOMER_SERVICE_SUPERVISOR'"));
        assertFalse(expr.contains("'EVENT_COORDINATION_OFFICER'"));
    }
}