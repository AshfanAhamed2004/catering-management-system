package com.joy.catering.model;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter;
@Entity @Table(name="menu_items") @Getter @Setter
public class MenuItem extends BaseEntity {
 @Column(nullable=false,length=120) private String name;
 @Column(length=1000) private String description="";
 @Column(nullable=false,length=80) private String category;
 @Column(length=300) private String dietaryInformation="";
 @Column(nullable=false) private boolean active=true;
}
