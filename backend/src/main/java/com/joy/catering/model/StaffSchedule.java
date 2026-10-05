package com.joy.catering.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "staff_schedules", indexes = {
    @Index(name = "idx_staff_schedule_booking", columnList = "booking_id"),
    @Index(name = "idx_staff_schedule_staff", columnList = "staff_id")
})
@Getter
@Setter
public class StaffSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;

    @Column(nullable = false)
    private LocalDate shiftDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StaffScheduleStatus status = StaffScheduleStatus.SCHEDULED;

    @Column(length = 1000)
    private String notes;
}
