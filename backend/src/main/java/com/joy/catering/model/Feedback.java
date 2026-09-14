package com.joy.catering.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
public class Feedback extends BaseEntity {
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private int rating;

    @Column(length = 2000)
    private String comment;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "feedback_categories", joinColumns = @JoinColumn(name = "feedback_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private List<FeedbackCategory> categories = new ArrayList<>();

    @Column(length = 2000)
    private String staffResponse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackStatus status = FeedbackStatus.NEW;
}
