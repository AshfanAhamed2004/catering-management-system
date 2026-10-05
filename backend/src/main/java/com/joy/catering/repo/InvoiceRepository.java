package com.joy.catering.repo;

import com.joy.catering.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    @Query("SELECT SUM(i.amount) FROM Invoice i WHERE i.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") String status);

    long countByStatus(String status);

    interface CustomerInvoiceHistoryProjection {
        Long getId();
        String getInvoiceNumber();
        BigDecimal getAmount();
        String getStatus();
        String getEventName();
        java.time.OffsetDateTime getCreatedAt();
    }

    @Query("SELECT i.id as id, i.invoiceNumber as invoiceNumber, i.amount as amount, " +
           "i.status as status, i.eventName as eventName, i.createdAt as createdAt " +
           "FROM Invoice i " +
           "JOIN i.booking b " +
           "WHERE b.customer.id = :customerId " +
           "ORDER BY i.createdAt DESC, i.id DESC")
    java.util.List<CustomerInvoiceHistoryProjection> findHistoryByCustomerId(@Param("customerId") Long customerId);
}