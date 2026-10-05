package com.joy.catering.service;

import com.joy.catering.dto.Dtos.BillingMetricsOut;
import com.joy.catering.model.BookingStatus;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.InvoiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

public class BillingServiceTest {

    private InvoiceRepository invoiceRepository;
    private BookingRepository bookingRepository;
    private BillingService billingService;

    @BeforeEach
    void setUp() {
        invoiceRepository = Mockito.mock(InvoiceRepository.class);
        bookingRepository = Mockito.mock(BookingRepository.class);
        billingService = new BillingService(invoiceRepository, bookingRepository);
    }

    @Test
    void testGetBillingMetrics_Calculations() {
        when(invoiceRepository.sumAmountByStatus("Paid")).thenReturn(new BigDecimal("1500.00"));
        when(invoiceRepository.sumAmountByStatus("Pending Payment")).thenReturn(new BigDecimal("500.00"));
        when(bookingRepository.sumPipelineValue(Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED))).thenReturn(new BigDecimal("2000.00"));
        when(bookingRepository.averageBookingValue(Arrays.asList(BookingStatus.CANCELLED, BookingStatus.REJECTED))).thenReturn(new BigDecimal("100.00"));
        when(invoiceRepository.countByStatus("Paid")).thenReturn(15L);
        when(invoiceRepository.countByStatus("Pending Payment")).thenReturn(5L);

        BillingMetricsOut metrics = billingService.getBillingMetrics();

        assertEquals(new BigDecimal("1500.00"), metrics.totalPaidRevenue());
        assertEquals(new BigDecimal("500.00"), metrics.pendingReceivables());
        assertEquals(new BigDecimal("2000.00"), metrics.pipelineBookingValue());
        assertEquals(new BigDecimal("100.00"), metrics.averageBookingValue());
        assertEquals(15L, metrics.paidInvoiceCount());
        assertEquals(5L, metrics.pendingInvoiceCount());
    }

    @Test
    void testGetBillingMetrics_EmptyDatabase() {
        when(invoiceRepository.sumAmountByStatus(any())).thenReturn(null);
        when(bookingRepository.sumPipelineValue(any())).thenReturn(null);
        when(bookingRepository.averageBookingValue(any())).thenReturn(null);
        when(invoiceRepository.countByStatus(any())).thenReturn(0L);

        BillingMetricsOut metrics = billingService.getBillingMetrics();

        assertEquals(BigDecimal.ZERO, metrics.totalPaidRevenue());
        assertEquals(BigDecimal.ZERO, metrics.pendingReceivables());
        assertEquals(BigDecimal.ZERO, metrics.pipelineBookingValue());
        assertEquals(BigDecimal.ZERO, metrics.averageBookingValue());
        assertEquals(0L, metrics.paidInvoiceCount());
        assertEquals(0L, metrics.pendingInvoiceCount());
    }
}