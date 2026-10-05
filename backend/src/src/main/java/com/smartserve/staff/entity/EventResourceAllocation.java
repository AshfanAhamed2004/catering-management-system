package com.smartserve.staff.entity;

import jakarta.persistence.*;

@Entity
@Table(name="event_resource_allocations", uniqueConstraints={
    @UniqueConstraint(columnNames={"event_id", "resource_id"})
})
public class EventResourceAllocation extends BaseEntity {
    @ManyToOne
    @JoinColumn(name="event_id", nullable=false)
    public SchedulingEvent event;
    public SchedulingEvent getEvent(){return event;}

    @ManyToOne
    @JoinColumn(name="resource_id", nullable=false)
    public Resource resource;
    public Resource getResource(){return resource;}

    @Column(nullable=false)
    public int quantityAllocated;
    public int getQuantityAllocated(){return quantityAllocated;}

    @Column(length=500)
    public String notes;
    public String getNotes(){return notes;}
}
