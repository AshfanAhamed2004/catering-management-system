package com.joy.catering;
import com.joy.catering.dto.Dtos.*; import com.joy.catering.model.*;
public final class Mapping {
 public static UserOut user(User u){return new UserOut(u.getId(),u.getEmail(),u.getRole(),u.isActive(),u.getCreatedAt());}
 public static ProfileOut profile(CustomerProfile p){return new ProfileOut(p.getId(),p.getUser().getId(),p.getFullName(),p.getMobileNumber(),p.getAddress());}
 public static EventTypeOut event(EventType e){return new EventTypeOut(e.getId(),e.getName());}
 public static MenuOut menu(MenuItem m){return new MenuOut(m.getId(),m.getName(),m.getDescription(),m.getCategory(),m.getDietaryInformation(),m.isActive());}
 public static PackageOut pack(PackageEntity p){return new PackageOut(p.getId(),p.getName(),p.getDescription(),p.getEventType().getId(),event(p.getEventType()),p.getPricePerPerson(),p.getMinimumGuestCount(),p.getMaximumGuestCount(),p.isActive(),p.getMenuItems().stream().map(Mapping::menu).toList());}
 public static BookingOut booking(Booking b){return new BookingOut(b.getId(),b.getReference(),b.getPackageEntity().getId(),b.getPackageName(),b.getMenuSnapshot(),b.getPricePerPerson(),b.estimatedTotal(),b.getEventDate(),b.getEventTime(),b.getEventLocation(),b.getGuestCount(),b.getSpecialRequirements(),b.getStatus(),b.getRejectionReason(),b.getCreatedAt(),b.getUpdatedAt());}
 public static StaffBookingOut staffBooking(Booking b){var p=b.getCustomer().getProfile();return new StaffBookingOut(b.getId(),b.getReference(),b.getPackageEntity().getId(),b.getPackageName(),b.getMenuSnapshot(),b.getPricePerPerson(),b.estimatedTotal(),b.getEventDate(),b.getEventTime(),b.getEventLocation(),b.getGuestCount(),b.getSpecialRequirements(),b.getStatus(),b.getRejectionReason(),b.getCreatedAt(),b.getUpdatedAt(),b.getCustomer().getId(),p.getFullName(),b.getCustomer().getEmail(),p.getMobileNumber());}
 private Mapping(){}
}
