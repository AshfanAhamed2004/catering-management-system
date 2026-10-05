package com.joy.catering.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "waste_records", indexes = {
    @Index(name = "idx_waste_date", columnList = "wasteDate"),
    @Index(name = "idx_waste_booking", columnList = "booking_id"),
    @Index(name = "idx_waste_recorded_by", columnList = "recorded_by_id")
})
@Getter
@Setter
public class WasteRecord extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String ingredientName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, length = 30)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private WasteCategory category;

    @Column(nullable = false)
    private LocalDate wasteDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recorded_by_id", nullable = false)
    private User recordedBy;

    @Column(length = 1000)
    private String notes;
}
