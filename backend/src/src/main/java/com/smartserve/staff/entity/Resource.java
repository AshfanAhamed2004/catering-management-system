package com.smartserve.staff.entity;

import jakarta.persistence.*;

@Entity
@Table(name="resources")
public class Resource extends BaseEntity {
    @Column(nullable=false,length=120)
    public String name;
    public String getName(){return name;}

    @Column(nullable=false,length=40)
    public String category;
    public String getCategory(){return category;}

    @Column(nullable=false)
    public int quantityAvailable;
    public int getQuantityAvailable(){return quantityAvailable;}

    @Column(length=500)
    public String notes;
    public String getNotes(){return notes;}
}
