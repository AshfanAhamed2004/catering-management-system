package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="staff_requirements")
public class StaffRequirement extends BaseEntity {
    @ManyToOne @JoinColumn(nullable=false) public StaffSchedule schedule;
    public StaffSchedule getSchedule(){return schedule;}
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) public Area area;
    public Area getArea(){return area;}
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) public Category category;
    public Category getCategory(){return category;}
    @Column(nullable=false) public int requiredCount;
    public int getRequiredCount(){return requiredCount;}
    @Column(nullable=false) public LocalDateTime startsAt;
    public LocalDateTime getStartsAt(){return startsAt;}
    @Column(nullable=false) public LocalDateTime endsAt;
    public LocalDateTime getEndsAt(){return endsAt;}
    @Column(length=1000) public String notes;
    public String getNotes(){return notes;}
}

