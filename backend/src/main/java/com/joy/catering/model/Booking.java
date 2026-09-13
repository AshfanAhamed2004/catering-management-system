package com.joy.catering.model;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter; import java.math.BigDecimal; import java.time.*; import java.util.*;
@Entity @Table(name="bookings") @Getter @Setter
public class Booking extends BaseEntity {
 @Column(nullable=false,unique=true,length=32) private String reference;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="customer_id",nullable=false) private User customer;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="package_id",nullable=false) private PackageEntity packageEntity;
 @Column(nullable=false,length=120) private String packageName;
 @ElementCollection @CollectionTable(name="booking_menu_snapshot",joinColumns=@JoinColumn(name="booking_id"))
 @Column(name="item_name") private List<String> menuSnapshot=new ArrayList<>();
 @Column(nullable=false,precision=12,scale=2) private BigDecimal pricePerPerson;
 @Column(nullable=false) private LocalDate eventDate;
 @Column(nullable=false) private LocalTime eventTime;
 @Column(nullable=false,length=500) private String eventLocation;
 @Column(nullable=false) private int guestCount;
 @Column(length=2000) private String specialRequirements="";
 @Enumerated(EnumType.STRING) @Column(nullable=false) private BookingStatus status=BookingStatus.PENDING;
 @Column(length=500) private String rejectionReason;
 public BigDecimal estimatedTotal(){return pricePerPerson.multiply(BigDecimal.valueOf(guestCount));}
}
