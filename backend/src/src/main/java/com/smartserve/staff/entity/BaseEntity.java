package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.Instant;
@MappedSuperclass
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Version @Column(nullable=false) public long version;
    @Column(nullable=false,updatable=false) public Instant createdAt;
    @Column(nullable=false) public Instant updatedAt;
    @PrePersist void create(){createdAt=Instant.now();updatedAt=createdAt;}
    @PreUpdate void update(){updatedAt=Instant.now();}
    public Long getId(){return id;}
    public Instant getCreatedAt(){return createdAt;}
}
