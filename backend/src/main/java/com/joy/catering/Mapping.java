package com.joy.catering;
import com.joy.catering.dto.Dtos.*; import com.joy.catering.model.*;
public final class Mapping {
 public static UserOut user(User u){return new UserOut(u.getId(),u.getEmail(),u.getProfile()!=null?u.getProfile().getFullName():null,u.getRole(),u.isActive(),u.getCreatedAt());}
 public static ProfileOut profile(CustomerProfile p){return new ProfileOut(p.getId(),p.getUser().getId(),p.getFullName(),p.getMobileNumber(),p.getAddress());}
 public static EventTypeOut event(EventType e){return new EventTypeOut(e.getId(),e.getName());}
 public static MenuOut menu(MenuItem m){return new MenuOut(m.getId(),m.getName(),m.getDescription(),m.getCategory(),m.getDietaryInformation(),m.isActive());}
 public static PackageOut pack(PackageEntity p){return new PackageOut(p.getId(),p.getName(),p.getDescription(),p.getEventType().getId(),event(p.getEventType()),p.getPricePerPerson(),p.getMinimumGuestCount(),p.getMaximumGuestCount(),p.isActive(),p.getMenuItems().stream().map(Mapping::menu).toList());}
 public static BookingOut booking(Booking b){return new BookingOut(b.getId(),b.getReference(),b.getPackageEntity().getId(),b.getPackageName(),new java.util.ArrayList<>(b.getMenuSnapshot()),b.getPricePerPerson(),b.estimatedTotal(),b.getEventDate(),b.getEventTime(),b.getEventLocation(),b.getGuestCount(),b.getSpecialRequirements(),b.getStatus(),b.getRejectionReason(),b.getCreatedAt(),b.getUpdatedAt());}
 public static StaffBookingOut staffBooking(Booking b){var p=b.getCustomer().getProfile();return new StaffBookingOut(b.getId(),b.getReference(),b.getPackageEntity().getId(),b.getPackageName(),new java.util.ArrayList<>(b.getMenuSnapshot()),b.getPricePerPerson(),b.estimatedTotal(),b.getEventDate(),b.getEventTime(),b.getEventLocation(),b.getGuestCount(),b.getSpecialRequirements(),b.getStatus(),b.getRejectionReason(),b.getCreatedAt(),b.getUpdatedAt(),b.getCustomer().getId(),p.getFullName(),b.getCustomer().getEmail(),p.getMobileNumber());}
 public static FeedbackOut feedback(Feedback f){return new FeedbackOut(f.getId(), f.getBooking().getId(), f.getBooking().getReference(), f.getRating(), f.getComment(), f.getCategories(), f.getStaffResponse(), f.getStatus().normalize(), f.getCreatedAt(), f.getUpdatedAt());}
 public static StaffFeedbackOut staffFeedback(Feedback f){var p=f.getCustomer().getProfile();return new StaffFeedbackOut(f.getId(), f.getBooking().getId(), f.getBooking().getReference(), f.getRating(), f.getComment(), f.getCategories(), f.getStaffResponse(), f.getStatus().normalize(), f.getCreatedAt(), f.getUpdatedAt(), f.getCustomer().getId(), p.getFullName(), f.getCustomer().getEmail(), p.getMobileNumber());}
 public static BillingInvoiceOut billingInvoice(Invoice i){return new BillingInvoiceOut(i.getId(), i.getInvoiceNumber(), i.getAmount(), i.getStatus(), i.getClientName(), i.getEventName(), i.getCreatedAt(), i.getBooking() != null ? i.getBooking().getId() : null, i.getBooking() != null ? i.getBooking().getStatus().name() : null);}

    public static ScheduleOut schedule(StaffSchedule s) {
        String staffName = s.getStaff().getProfile() != null ? s.getStaff().getProfile().getFullName() : "";
        return new ScheduleOut(s.getId(), s.getBooking().getId(), s.getBooking().getReference(), s.getStaff().getId(), staffName, s.getStaff().getRole(), s.getShiftDate(), s.getStartTime(), s.getEndTime(), s.getStatus(), s.getNotes(), s.getCreatedAt(), s.getUpdatedAt());
    }
    public static StaffOptionOut staffOption(User u) {
        String name = u.getProfile() != null ? u.getProfile().getFullName() : "";
        return new StaffOptionOut(u.getId(), name, u.getRole(), u.isActive());
    }
    public static BookingOptionOut bookingOption(Booking b) {
        return new BookingOptionOut(b.getId(), b.getReference(), b.getEventDate(), b.getEventTime(), b.getEventLocation(), b.getGuestCount(), b.getStatus());
    }
    public static com.joy.catering.dto.Dtos.WasteOut waste(com.joy.catering.model.WasteRecord w) {
        String recorderName = w.getRecordedBy().getProfile() != null ? w.getRecordedBy().getProfile().getFullName() : "";
        Long bId = w.getBooking() != null ? w.getBooking().getId() : null;
        String bRef = w.getBooking() != null ? w.getBooking().getReference() : null;
        java.time.LocalDate bDate = w.getBooking() != null ? w.getBooking().getEventDate() : null;
        Integer bGuests = w.getBooking() != null ? w.getBooking().getGuestCount() : null;
        return new com.joy.catering.dto.Dtos.WasteOut(w.getId(), w.getIngredientName(), w.getQuantity(), w.getUnit(), w.getCategory(), w.getWasteDate(), bId, bRef, bDate, bGuests, w.getRecordedBy().getId(), recorderName, w.getNotes(), w.getCreatedAt(), w.getUpdatedAt());
    }

    public static IngredientRequirementOut ingredientReq(IngredientRequirement r) {
        return new IngredientRequirementOut(r.getId(), r.getMenuItem().getId(), r.getIngredientName(), r.getQuantityPerGuest(), r.getUnit());
    }

 public static com.joy.catering.dto.Dtos.InquiryOut inquiry(com.joy.catering.model.Inquiry i) { String cName = i.getCustomer().getProfile() != null ? i.getCustomer().getProfile().getFullName() : ""; return new com.joy.catering.dto.Dtos.InquiryOut(i.getId(), i.getCustomer().getId(), cName, i.getSubject(), i.getMessage(), i.getReply(), i.getStatus(), i.getCreatedAt(), i.getRepliedAt()); } private Mapping(){}
}
