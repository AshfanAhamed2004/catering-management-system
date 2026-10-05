package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="staffing_requests")
public class StaffingRequest extends BaseEntity {
    @ManyToOne @JoinColumn(nullable=false) public StaffRequirement requirement;
    public StaffRequirement getRequirement(){return requirement;}
    @Column(nullable=false) public int numberNeeded;
    public int getNumberNeeded(){return numberNeeded;}
    @Column(nullable=false) public Instant requestedAt;
    public Instant getRequestedAt(){return requestedAt;}
    @Column(nullable=false,length=30) public String status="OPEN";
    public String getStatus(){return status;}
    @Column(length=1000) public String notes;
    public String getNotes(){return notes;}
}

