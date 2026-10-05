package com.joy.catering.model;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Index;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "invoices", indexes = {
    @Index(name = "idx_invoice_booking", columnList = "booking_id")
})
@Getter
@Setter
public class Invoice extends BaseEntity {
    
    @Column(unique = true)
    private String invoiceNumber;
    
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @Column(precision = 12, scale = 2)
    private BigDecimal amount;
    
    private String status; // e.g., "Pending Payment", "Paid"
    private String clientName;
    private String eventName;
}
