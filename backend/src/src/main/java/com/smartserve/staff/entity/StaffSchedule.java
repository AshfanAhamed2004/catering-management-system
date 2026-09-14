package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="staff_schedules")
public class StaffSchedule extends BaseEntity {
    @OneToOne @JoinColumn(nullable=false,unique=true) public SchedulingEvent event;
    public SchedulingEvent getEvent(){return event;}
    @Column(nullable=false,length=20) public String status="DRAFT";
    public String getStatus(){return status;}
    @Column public Instant publishedAt;
    public Instant getPublishedAt(){return publishedAt;}
}

