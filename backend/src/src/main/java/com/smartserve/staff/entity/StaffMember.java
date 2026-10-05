package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="staff_members")
public class StaffMember extends BaseEntity {
    @OneToOne @JoinColumn(unique=true) public AppUser user;
    public AppUser getUser(){return user;}
    @Column(nullable=false,length=120) public String name;
    public String getName(){return name;}
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) public Category category;
    public Category getCategory(){return category;}
    @Column(length=120) public String contact;
    public String getContact(){return contact;}
    @Column(nullable=false) public boolean active=true;
    public boolean getActive(){return active;}
}

