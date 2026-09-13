package com.joy.catering.model;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.util.*;
@Entity @Table(name="packages") @Getter @Setter
public class PackageEntity extends BaseEntity {
 @Column(nullable=false,length=120) private String name;
 @Column(nullable=false,length=2000) private String description;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="event_type_id",nullable=false) private EventType eventType;
 @Column(nullable=false,precision=12,scale=2) private BigDecimal pricePerPerson;
 @Column(nullable=false) private int minimumGuestCount;
 private Integer maximumGuestCount;
 @Column(nullable=false) private boolean active=true;
 @ManyToMany(fetch=FetchType.EAGER)
 @JoinTable(name="package_menu_items",joinColumns=@JoinColumn(name="package_id"),inverseJoinColumns=@JoinColumn(name="menu_item_id"))
 private List<MenuItem> menuItems=new ArrayList<>();
}
