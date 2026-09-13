package com.joy.catering.model;
import jakarta.persistence.*; import lombok.Getter; import lombok.Setter; import java.time.OffsetDateTime;
@Entity @Table(name="password_resets") @Getter @Setter
public class PasswordReset extends BaseEntity {
    @ManyToOne @JoinColumn(name="user_id",nullable=false) private User user;
    @Column(nullable=false,unique=true,length=64) private String tokenHash;
    @Column(nullable=false) private OffsetDateTime expiresAt;
    @Column(nullable=false) private boolean used=false;
}
