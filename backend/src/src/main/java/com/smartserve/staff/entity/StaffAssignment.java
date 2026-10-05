package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="staff_assignments")
public class StaffAssignment extends BaseEntity {
    @ManyToOne @JoinColumn(nullable=false) public StaffRequirement requirement;
    public StaffRequirement getRequirement(){return requirement;}
    @ManyToOne @JoinColumn(nullable=false) public StaffMember staff;
    public StaffMember getStaff(){return staff;}
}

