package com.joy.catering.dto;
import com.joy.catering.model.*; import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.time.*; import java.util.*;
public final class Dtos {
 public record Register(@Email @NotBlank String email,@Size(min=10,max=128) String password,@NotBlank String passwordConfirmation,
   @Size(min=2,max=120) String fullName,@Pattern(regexp="^(?:\\+94|0)7[0-9]{8}$") String mobileNumber,@Size(max=500) String address){}
 public record Login(@Email @NotBlank String email,@NotBlank String password){}
 public record EmailInput(@Email @NotBlank String email){}
 public record ResetPassword(@Size(min=10,max=128) String password,@NotBlank String passwordConfirmation,@Size(min=20,max=200) String token){}
 public record ProfileInput(@Size(min=2,max=120) String fullName,@Pattern(regexp="^(?:\\+94|0)7[0-9]{8}$") String mobileNumber,@Size(max=500) String address){}
 public record UserUpdate(Role role,boolean isActive, String fullName){}
 public record EventTypeInput(@Size(min=2,max=80) String name){}
 public record MenuInput(@Size(min=2,max=120) String name,@Size(max=1000) String description,@Size(min=2,max=80) String category,@Size(max=300) String dietaryInformation,boolean isActive){}
 public record PackageInput(@Size(min=2,max=120) String name,@Size(min=2,max=2000) String description,@Positive Long eventTypeId,@Positive BigDecimal pricePerPerson,@Positive int minimumGuestCount,Integer maximumGuestCount,@NotEmpty List<Long> menuItemIds,boolean isActive){}
 public record BookingInput(@Positive Long packageId,@Future LocalDate eventDate,@NotNull LocalTime eventTime,@Size(min=3,max=500) String eventLocation,@Positive @Max(100000) int guestCount,@Size(max=2000) String specialRequirements){}
 public record RejectInput(@Size(max=500) String reason){}
 public record UserOut(Long id,String email,String fullName,Role role,boolean isActive,OffsetDateTime createdAt){} public record StaffInput(@jakarta.validation.constraints.Size(min=2,max=120) String fullName, @jakarta.validation.constraints.Email @jakarta.validation.constraints.NotBlank String email, @jakarta.validation.constraints.Size(min=10,max=128) String password, @jakarta.validation.constraints.NotNull Role role){}
 public record ProfileOut(Long id,Long userId,String fullName,String mobileNumber,String address){}
 public record EventTypeOut(Long id,String name){}
 public record MenuOut(Long id,String name,String description,String category,String dietaryInformation,boolean isActive){}
 public record PackageOut(Long id,String name,String description,Long eventTypeId,EventTypeOut eventType,BigDecimal pricePerPerson,int minimumGuestCount,Integer maximumGuestCount,boolean isActive,List<MenuOut> menuItems){}
 public record BookingOut(Long id,String reference,Long packageId,String packageName,List<String> menuSnapshot,BigDecimal pricePerPerson,BigDecimal estimatedTotal,LocalDate eventDate,LocalTime eventTime,String eventLocation,int guestCount,String specialRequirements,BookingStatus status,String rejectionReason,OffsetDateTime createdAt,OffsetDateTime updatedAt){}
 public record CustomerBookingHistoryOut(Long id, String reference, LocalDate eventDate, String packageName, int guestCount, String eventLocation, com.joy.catering.model.BookingStatus status, BigDecimal estimatedTotal, OffsetDateTime createdAt){}
 public record CustomerFeedbackHistoryOut(Long id, String bookingReference, int rating, String comment, List<com.joy.catering.model.FeedbackCategory> categories, String staffResponse, com.joy.catering.model.FeedbackStatus status, OffsetDateTime createdAt){}
 public record CustomerInvoiceHistoryOut(Long id, String invoiceNumber, BigDecimal amount, String status, String eventName, OffsetDateTime createdAt){}
 public record CustomerSummaryOut(Long id, String fullName, String email, String mobileNumber, boolean active, long totalBookings, OffsetDateTime createdAt){}
 public record CustomerProfileOut(Long id, String fullName, String email, String mobileNumber, String address, boolean active, OffsetDateTime createdAt){}
 public record CustomerMetricsOut(long totalBookings, long completedBookings, long cancelledBookings, BigDecimal pipelineBookingValue){}
 public record Customer360Out(CustomerProfileOut profile, CustomerMetricsOut metrics, List<CustomerBookingHistoryOut> bookings, List<CustomerFeedbackHistoryOut> feedback, List<CustomerInvoiceHistoryOut> invoices){}
 public record BillingMetricsOut(BigDecimal totalPaidRevenue, BigDecimal pendingReceivables, BigDecimal pipelineBookingValue, BigDecimal averageBookingValue, long paidInvoiceCount, long pendingInvoiceCount){}
 public record BillingInvoiceOut(Long id, String invoiceNumber, BigDecimal amount, String status, String clientName, String eventName, OffsetDateTime createdAt, Long bookingId, String bookingStatus){}
 public record StaffBookingOut(Long id,String reference,Long packageId,String packageName,List<String> menuSnapshot,BigDecimal pricePerPerson,BigDecimal estimatedTotal,LocalDate eventDate,LocalTime eventTime,String eventLocation,int guestCount,String specialRequirements,BookingStatus status,String rejectionReason,OffsetDateTime createdAt,OffsetDateTime updatedAt,Long customerId,String customerName,String customerEmail,String customerMobile){}
 public record FeedbackInput(@NotNull @Min(1) @Max(5) Integer rating, @Size(max=2000) String comment, List<FeedbackCategory> categories){}
 public record FeedbackUpdate(@NotNull @Min(1) @Max(5) Integer rating, @Size(max=2000) String comment, List<FeedbackCategory> categories){}
 public record StaffFeedbackUpdate(FeedbackStatus status, List<FeedbackCategory> categories, @Size(max=2000) String staffResponse){}
 public record FeedbackOut(Long id, Long bookingId, String bookingReference, int rating, String comment, List<FeedbackCategory> categories, String staffResponse, FeedbackStatus status, OffsetDateTime createdAt, OffsetDateTime updatedAt){}
 public record StaffFeedbackOut(Long id, Long bookingId, String bookingReference, int rating, String comment, List<FeedbackCategory> categories, String staffResponse, FeedbackStatus status, OffsetDateTime createdAt, OffsetDateTime updatedAt, Long customerId, String customerName, String customerEmail, String customerMobile){}
 public record FeedbackReportOut(long totalFeedback, double averageRating, long lowRatingCount, Map<Integer, Long> ratingDistribution, Map<FeedbackCategory, Long> categoryBreakdown, long submittedFeedbackCount, long unresolvedFeedbackCount, Map<String, Double> monthlyAverageRating, Map<String, Long> monthlyFeedbackCount){}

 public record ScheduleInput(@NotNull Long bookingId, @NotNull Long staffId, @NotNull LocalDate shiftDate, @NotNull LocalTime startTime, @NotNull LocalTime endTime, @Size(max=1000) String notes){}
 public record ScheduleUpdate(@NotNull LocalDate shiftDate, @NotNull LocalTime startTime, @NotNull LocalTime endTime, StaffScheduleStatus status, @Size(max=1000) String notes){}
 public record ScheduleOut(Long id, Long bookingId, String bookingReference, Long staffId, String staffName, Role staffRole, LocalDate shiftDate, LocalTime startTime, LocalTime endTime, StaffScheduleStatus status, String notes, OffsetDateTime createdAt, OffsetDateTime updatedAt){}

 public record StaffOptionOut(Long id, String fullName, Role role, boolean active){}
 public record BookingOptionOut(Long id, String reference, LocalDate eventDate, LocalTime eventTime, String eventLocation, int guestCount, BookingStatus status){}

 public record WasteInput(@NotBlank String ingredientName, @NotNull @Positive java.math.BigDecimal quantity, @NotBlank String unit, @NotNull com.joy.catering.model.WasteCategory category, @NotNull LocalDate wasteDate, Long bookingId, String notes){}
 public record WasteOut(Long id, String ingredientName, java.math.BigDecimal quantity, String unit, com.joy.catering.model.WasteCategory category, LocalDate wasteDate, Long bookingId, String bookingReference, LocalDate eventDate, Integer guestCount, Long recordedById, String recordedByName, String notes, OffsetDateTime createdAt, OffsetDateTime updatedAt){}
 public record WasteSummaryOut(java.math.BigDecimal totalQuantity, java.util.Map<String, java.math.BigDecimal> byIngredient, java.util.Map<String, java.math.BigDecimal> byCategory){}
 
 public record IngredientRequirementInput(@NotBlank String ingredientName, @NotNull @Positive java.math.BigDecimal quantityPerGuest, @NotBlank String unit){}
 public record IngredientRequirementOut(Long id, Long menuItemId, String ingredientName, java.math.BigDecimal quantityPerGuest, String unit){}


 public record ForecastItemOut(String ingredientName, String unit, java.math.BigDecimal quantityPerGuestTotal, java.math.BigDecimal requiredQuantity, java.util.List<String> contributingMenuItems){}
 public record ForecastOut(Long bookingId, String bookingReference, Long packageId, String packageName, java.time.LocalDate eventDate, int guestCount, java.util.List<ForecastItemOut> items){}

 public record InquiryInput(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=255) String subject, @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=2000) String message){} public record InquiryReplyInput(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=2000) String reply){} public record InquiryOut(Long id, Long customerId, String customerName, String subject, String message, String reply, com.joy.catering.model.InquiryStatus status, java.time.OffsetDateTime createdAt, java.time.OffsetDateTime repliedAt){} private Dtos(){}
}





