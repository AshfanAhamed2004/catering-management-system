package com.joy.catering.model;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "invoices")
@Getter
@Setter
public class Invoice extends BaseEntity {
    
    private String invoiceNumber;
    
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    private BigDecimal amount;
    private String status; // e.g., "Pending Payment", "Paid"
    private String clientName;
    private String eventName;
}
