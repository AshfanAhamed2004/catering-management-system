package com.joy.catering.repo; 
import com.joy.catering.model.*; 
import java.util.*; 
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking,Long>{
    List<Booking> findByCustomerIdOrderByCreatedAtDescIdDesc(Long id); 
    List<Booking> findAllByOrderByCreatedAtDescIdDesc(); 
    List<Booking> findByStatusOrderByCreatedAtDescIdDesc(BookingStatus s); 
    List<Booking> findByStatusNotInOrderByCreatedAtDescIdDesc(List<BookingStatus> statuses);

    @Query("SELECT SUM(b.pricePerPerson * b.guestCount) FROM Booking b WHERE b.status IN :statuses")
    BigDecimal sumPipelineValue(@Param("statuses") List<BookingStatus> statuses);

    @Query("SELECT AVG(b.pricePerPerson * b.guestCount) FROM Booking b WHERE b.status NOT IN :excludedStatuses")
    BigDecimal averageBookingValue(@Param("excludedStatuses") List<BookingStatus> excludedStatuses);

    interface CustomerBookingHistoryProjection {
        Long getId();
        String getReference();
        LocalDate getEventDate();
        String getPackageName();
        Integer getGuestCount();
        String getEventLocation();
        BookingStatus getStatus();
        BigDecimal getEstimatedTotal();
        OffsetDateTime getCreatedAt();
    }

    @Query("SELECT b.id as id, b.reference as reference, b.eventDate as eventDate, " +
           "p.name as packageName, b.guestCount as guestCount, b.eventLocation as eventLocation, " +
           "b.status as status, (b.pricePerPerson * b.guestCount) as estimatedTotal, b.createdAt as createdAt " +
           "FROM Booking b LEFT JOIN b.packageEntity p " +
           "WHERE b.customer.id = :customerId " +
           "ORDER BY b.createdAt DESC, b.id DESC")
    List<CustomerBookingHistoryProjection> findHistoryByCustomerId(@Param("customerId") Long customerId);

    interface CustomerMetricsProjection {
        Long getTotalBookings();
        Long getCompletedBookings();
        Long getCancelledBookings();
        BigDecimal getPipelineBookingValue();
    }

    @Query("SELECT " +
           "COUNT(b) as totalBookings, " +
           "SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedBookings, " +
           "SUM(CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledBookings, " +
           "SUM(CASE WHEN b.status IN ('PENDING', 'APPROVED') THEN (b.pricePerPerson * b.guestCount) ELSE 0 END) as pipelineBookingValue " +
           "FROM Booking b " +
           "WHERE b.customer.id = :customerId")
    CustomerMetricsProjection calculateCustomerMetrics(@Param("customerId") Long customerId);
}