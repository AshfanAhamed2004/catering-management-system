package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="staff_availability")
public class Availability extends BaseEntity {
    @ManyToOne @JoinColumn(nullable=false) public StaffMember staff;
    public StaffMember getStaff(){return staff;}
    @Column(nullable=false) public LocalDateTime startsAt;
    public LocalDateTime getStartsAt(){return startsAt;}
    @Column(nullable=false) public LocalDateTime endsAt;
    public LocalDateTime getEndsAt(){return endsAt;}
    @Column(nullable=false) public boolean available;
    public boolean getAvailable(){return available;}
    @Column(length=500) public String notes;
    public String getNotes(){return notes;}
}

