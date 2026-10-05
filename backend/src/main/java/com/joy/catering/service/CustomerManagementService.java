package com.joy.catering.service;

import com.joy.catering.dto.Dtos.CustomerSummaryOut;
import com.joy.catering.dto.Dtos.CustomerBookingHistoryOut;
import com.joy.catering.dto.Dtos.CustomerFeedbackHistoryOut;
import com.joy.catering.ApiException;
import org.springframework.http.HttpStatus;
import com.joy.catering.model.Role;
import com.joy.catering.model.User;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.FeedbackRepository;
import com.joy.catering.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CustomerManagementService {
    
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final FeedbackRepository feedbackRepository;
    private final com.joy.catering.repo.InvoiceRepository invoiceRepository;

    public CustomerManagementService(UserRepository userRepository, BookingRepository bookingRepository, FeedbackRepository feedbackRepository, com.joy.catering.repo.InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.feedbackRepository = feedbackRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public com.joy.catering.dto.Dtos.Customer360Out toggleCustomerActive(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        
        if (user.getRole() != Role.CUSTOMER) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User is not a customer");
        }
        
        user.setActive(!user.isActive());
        userRepository.save(user);
        
        return getCustomer360(customerId);
    }

    public List<CustomerSummaryOut> searchCustomers(String search) {
        String searchTerm = (search == null || search.trim().isEmpty()) ? null : "%" + search.trim().toLowerCase() + "%";
        return userRepository.searchCustomers(searchTerm).stream()
            .map(p -> new CustomerSummaryOut(
                p.getId(),
                p.getFullName(),
                p.getEmail(),
                p.getMobileNumber(),
                p.getActive() != null ? p.getActive() : false,
                p.getTotalBookings() != null ? p.getTotalBookings() : 0L,
                p.getCreatedAt()
            )).toList();
    }

    public List<CustomerBookingHistoryOut> getCustomerBookings(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        
        if (user.getRole() != Role.CUSTOMER) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User is not a customer");
        }

        return bookingRepository.findHistoryByCustomerId(customerId).stream()
            .map(p -> new CustomerBookingHistoryOut(
                p.getId(),
                p.getReference(),
                p.getEventDate(),
                p.getPackageName(),
                p.getGuestCount(),
                p.getEventLocation(),
                p.getStatus(),
                p.getEstimatedTotal(),
                p.getCreatedAt()
            )).toList();
    }

    public List<CustomerFeedbackHistoryOut> getCustomerFeedback(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        
        if (user.getRole() != Role.CUSTOMER) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User is not a customer");
        }

        List<FeedbackRepository.CustomerFeedbackFlatProjection> flats = feedbackRepository.findFlatHistoryByCustomerId(customerId);

        // Use LinkedHashMap to preserve query ordering (createdAt DESC, id DESC)
        Map<Long, CustomerFeedbackHistoryOut> grouped = new LinkedHashMap<>();

        for (var f : flats) {
            if (!grouped.containsKey(f.getId())) {
                // normalize() maps any deprecated legacy DB values to their canonical equivalents.
                // This is the same normalization applied by Mapping.staffFeedback() so that the
                // CRM Customer 360 and the staff Feedback Management page show consistent statuses.
                com.joy.catering.model.FeedbackStatus canonicalStatus = f.getStatus().normalize();

                grouped.put(f.getId(), new CustomerFeedbackHistoryOut(
                    f.getId(),
                    f.getBookingReference(),
                    f.getRating(),
                    f.getComment(),
                    new ArrayList<>(),
                    f.getStaffResponse(),
                    canonicalStatus,
                    f.getCreatedAt()
                ));
            }
            if (f.getCategory() != null) {
                grouped.get(f.getId()).categories().add(f.getCategory());
            }
        }

        return new ArrayList<>(grouped.values());
    }

    public List<com.joy.catering.dto.Dtos.CustomerInvoiceHistoryOut> getCustomerInvoices(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        
        if (user.getRole() != Role.CUSTOMER) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User is not a customer");
        }

        return invoiceRepository.findHistoryByCustomerId(customerId).stream()
            .map(p -> new com.joy.catering.dto.Dtos.CustomerInvoiceHistoryOut(
                p.getId(),
                p.getInvoiceNumber(),
                p.getAmount(),
                p.getStatus(),
                p.getEventName(),
                p.getCreatedAt()
            )).toList();
    }

    public com.joy.catering.dto.Dtos.Customer360Out getCustomer360(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        
        if (user.getRole() != Role.CUSTOMER) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User is not a customer");
        }

        com.joy.catering.dto.Dtos.CustomerProfileOut profile = new com.joy.catering.dto.Dtos.CustomerProfileOut(
            user.getId(),
            user.getProfile() != null ? user.getProfile().getFullName() : null,
            user.getEmail(),
            user.getProfile() != null ? user.getProfile().getMobileNumber() : null,
            user.getProfile() != null ? user.getProfile().getAddress() : null,
            user.isActive(),
            user.getCreatedAt()
        );

        BookingRepository.CustomerMetricsProjection proj = bookingRepository.calculateCustomerMetrics(customerId);
        com.joy.catering.dto.Dtos.CustomerMetricsOut metrics = new com.joy.catering.dto.Dtos.CustomerMetricsOut(
            proj.getTotalBookings() != null ? proj.getTotalBookings() : 0L,
            proj.getCompletedBookings() != null ? proj.getCompletedBookings() : 0L,
            proj.getCancelledBookings() != null ? proj.getCancelledBookings() : 0L,
            proj.getPipelineBookingValue() != null ? proj.getPipelineBookingValue() : java.math.BigDecimal.ZERO
        );

        return new com.joy.catering.dto.Dtos.Customer360Out(
            profile,
            metrics,
            getCustomerBookings(customerId),
            getCustomerFeedback(customerId),
            getCustomerInvoices(customerId)
        );
    }
}