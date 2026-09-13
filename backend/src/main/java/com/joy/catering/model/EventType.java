package com.joy.catering.model;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter;
@Entity @Table(name="event_types") @Getter @Setter
public class EventType extends BaseEntity { @Column(nullable=false,unique=true,length=80) private String name; }
