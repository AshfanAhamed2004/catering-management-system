package com.joy.catering.model;
import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
@Entity @Table(name="users") @Getter @Setter
public class User extends BaseEntity {
    @Column(nullable=false,unique=true,length=254) private String email;
    @Column(nullable=false,length=255) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role=Role.CUSTOMER;
    @Column(nullable=false) private boolean active=true;
    @Column(nullable=false) private int tokenVersion=0;
    @OneToOne(mappedBy="user",cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.EAGER) private CustomerProfile profile;
}
