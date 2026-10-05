package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="schedule_audit")
public class ScheduleAudit extends BaseEntity {
    @ManyToOne @JoinColumn(nullable=false) public StaffSchedule schedule;
    public StaffSchedule getSchedule(){return schedule;}
    @ManyToOne @JoinColumn(nullable=false) public AppUser actor;
    public AppUser getActor(){return actor;}
    @Column(nullable=false,length=60) public String action;
    public String getAction(){return action;}
    @Column(nullable=false,length=1000) public String detail;
    public String getDetail(){return detail;}
    @Column(nullable=false) public Instant occurredAt;
    public Instant getOccurredAt(){return occurredAt;}
}

