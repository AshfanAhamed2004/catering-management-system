package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="staff_schedule_notifications")
public class ScheduleNotice extends BaseEntity {
    @OneToOne @JoinColumn(nullable=false,unique=true) public StaffAssignment assignment;
    public StaffAssignment getAssignment(){return assignment;}
    @Column(nullable=false,length=40) public String eventReference;
    public String getEventReference(){return eventReference;}
    @Column(nullable=false,length=120) public String eventName;
    public String getEventName(){return eventName;}
    @Column(nullable=false,length=120) public String staffName;
    public String getStaffName(){return staffName;}
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) public Area area;
    public Area getArea(){return area;}
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) public Category category;
    public Category getCategory(){return category;}
    @Column(nullable=false) public LocalDateTime startsAt;
    public LocalDateTime getStartsAt(){return startsAt;}
    @Column(nullable=false) public LocalDateTime endsAt;
    public LocalDateTime getEndsAt(){return endsAt;}
    @Column(nullable=false) public Instant publishedAt;
    public Instant getPublishedAt(){return publishedAt;}
    @Column public Instant sentAt;
    public Instant getSentAt(){return sentAt;}
    @Column(nullable=false,length=20) public String deliveryStatus="PENDING";
    public String getDeliveryStatus(){return deliveryStatus;}
    @Column public Instant deliveredAt;
    public Instant getDeliveredAt(){return deliveredAt;}
    @Column(nullable=false,length=20) public String acknowledgmentStatus="PENDING";
    public String getAcknowledgmentStatus(){return acknowledgmentStatus;}
    @Column public Instant acknowledgedAt;
    public Instant getAcknowledgedAt(){return acknowledgedAt;}
    @Column(nullable=false) public int resendCount=0;
    public int getResendCount(){return resendCount;}
    @Column public Instant lastSentAt;
    public Instant getLastSentAt(){return lastSentAt;}
}

