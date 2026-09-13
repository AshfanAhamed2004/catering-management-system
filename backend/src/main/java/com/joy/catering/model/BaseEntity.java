package com.joy.catering.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
@MappedSuperclass @Getter @Setter
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, updatable=false) private OffsetDateTime createdAt;
    @Column(nullable=false) private OffsetDateTime updatedAt;
    @PrePersist void created(){ createdAt=OffsetDateTime.now(); updatedAt=createdAt; }
    @PreUpdate void updated(){ updatedAt=OffsetDateTime.now(); }
}
