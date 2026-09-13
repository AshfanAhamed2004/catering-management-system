package com.joy.catering.model;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter;
@Entity @Table(name="customer_profiles") @Getter @Setter
public class CustomerProfile extends BaseEntity {
    @OneToOne @JoinColumn(name="user_id",nullable=false,unique=true) private User user;
    @Column(nullable=false,length=120) private String fullName;
    @Column(nullable=false,length=20) private String mobileNumber;
    @Column(length=500) private String address;
}
