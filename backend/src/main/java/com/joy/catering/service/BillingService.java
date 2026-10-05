package com.joy.catering.service;

import com.joy.catering.dto.Dtos.BillingMetricsOut;
import com.joy.catering.model.BookingStatus;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;

    public BillingService(InvoiceRepository invoiceRepository, BookingRepository bookingRepository) {
        this.invoiceRepository = invoiceRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public BillingMetricsOut getBillingMetrics() {
        BigDecimal totalPaid = invoiceRepository.sumAmountByStatus("Paid");
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;

        BigDecimal pendingReceivables = invoiceRepository.sumAmountByStatus("Pending Payment");
        if (pendingReceivables == null) pendingReceivables = BigDecimal.ZERO;

        List<BookingStatus> pipelineStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        BigDecimal pipelineValue = bookingRepository.sumPipelineValue(pipelineStatuses);
        if (pipelineValue == null) pipelineValue = BigDecimal.ZERO;

        List<BookingStatus> excludedStatuses = Arrays.asList(BookingStatus.CANCELLED, BookingStatus.REJECTED);
        BigDecimal avgBookingValue = bookingRepository.averageBookingValue(excludedStatuses);
        if (avgBookingValue == null) avgBookingValue = BigDecimal.ZERO;

        long paidCount = invoiceRepository.countByStatus("Paid");
        long pendingCount = invoiceRepository.countByStatus("Pending Payment");

        return new BillingMetricsOut(
                totalPaid,
                pendingReceivables,
                pipelineValue,
                avgBookingValue,
                paidCount,
                pendingCount
        );
    }
}