package com.smartserve.staff.entity;
import jakarta.persistence.*;
import java.time.*;
@Entity @Table(name="users")
public class AppUser extends BaseEntity {
    @Column(nullable=false,unique=true,length=254) public String email;
    public String getEmail(){return email;}
    @Column(nullable=false,length=255) public String passwordHash;
    public String getPasswordHash(){return passwordHash;}
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) public Role role;
    public Role getRole(){return role;}
    @Column(nullable=false) public boolean active=true;
    public boolean getActive(){return active;}
}

