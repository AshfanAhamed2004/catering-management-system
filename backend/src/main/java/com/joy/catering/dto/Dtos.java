package com.joy.catering.dto;
import com.joy.catering.model.*; import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.time.*; import java.util.*;
public final class Dtos {
 public record Register(@Email @NotBlank String email,@Size(min=10,max=128) String password,@NotBlank String passwordConfirmation,
   @Size(min=2,max=120) String fullName,@Pattern(regexp="^(?:\\+94|0)7[0-9]{8}$") String mobileNumber,@Size(max=500) String address){}
 public record Login(@Email @NotBlank String email,@NotBlank String password){}
 public record EmailInput(@Email @NotBlank String email){}
 public record ResetPassword(@Size(min=10,max=128) String password,@NotBlank String passwordConfirmation,@Size(min=20,max=200) String token){}
 public record ProfileInput(@Size(min=2,max=120) String fullName,@Pattern(regexp="^(?:\\+94|0)7[0-9]{8}$") String mobileNumber,@Size(max=500) String address){}
 public record UserUpdate(Role role,boolean isActive){}
 public record EventTypeInput(@Size(min=2,max=80) String name){}
 public record MenuInput(@Size(min=2,max=120) String name,@Size(max=1000) String description,@Size(min=2,max=80) String category,@Size(max=300) String dietaryInformation,boolean isActive){}
 public record PackageInput(@Size(min=2,max=120) String name,@Size(min=2,max=2000) String description,@Positive Long eventTypeId,@Positive BigDecimal pricePerPerson,@Positive int minimumGuestCount,Integer maximumGuestCount,@NotEmpty List<Long> menuItemIds,boolean isActive){}
 public record BookingInput(@Positive Long packageId,@Future LocalDate eventDate,@NotNull LocalTime eventTime,@Size(min=3,max=500) String eventLocation,@Positive @Max(100000) int guestCount,@Size(max=2000) String specialRequirements){}
 public record RejectInput(@Size(max=500) String reason){}
 public record UserOut(Long id,String email,Role role,boolean isActive,OffsetDateTime createdAt){}
 public record ProfileOut(Long id,Long userId,String fullName,String mobileNumber,String address){}
 public record EventTypeOut(Long id,String name){}
 public record MenuOut(Long id,String name,String description,String category,String dietaryInformation,boolean isActive){}
 public record PackageOut(Long id,String name,String description,Long eventTypeId,EventTypeOut eventType,BigDecimal pricePerPerson,int minimumGuestCount,Integer maximumGuestCount,boolean isActive,List<MenuOut> menuItems){}
 public record BookingOut(Long id,String reference,Long packageId,String packageName,List<String> menuSnapshot,BigDecimal pricePerPerson,BigDecimal estimatedTotal,LocalDate eventDate,LocalTime eventTime,String eventLocation,int guestCount,String specialRequirements,BookingStatus status,String rejectionReason,OffsetDateTime createdAt,OffsetDateTime updatedAt){}
 public record StaffBookingOut(Long id,String reference,Long packageId,String packageName,List<String> menuSnapshot,BigDecimal pricePerPerson,BigDecimal estimatedTotal,LocalDate eventDate,LocalTime eventTime,String eventLocation,int guestCount,String specialRequirements,BookingStatus status,String rejectionReason,OffsetDateTime createdAt,OffsetDateTime updatedAt,Long customerId,String customerName,String customerEmail,String customerMobile){}
 private Dtos(){}
}
