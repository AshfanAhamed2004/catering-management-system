package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="scheduling_events")
public class SchedulingEvent extends BaseEntity {
    @Column(nullable=false,unique=true,length=40) public String reference;
    public String getReference(){return reference;}
    @Column(nullable=false,length=120) public String name;
    public String getName(){return name;}
    @Column(nullable=false) public LocalDate eventDate;
    public LocalDate getEventDate(){return eventDate;}
    @Column(nullable=false,length=500) public String location;
    public String getLocation(){return location;}
}

