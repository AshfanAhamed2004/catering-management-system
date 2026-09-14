package com.smartserve.staff.dto;
import com.smartserve.staff.entity.*;
import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.*;
import java.util.Set;
public final class Forms {
    public record Event(@NotBlank @Pattern(regexp="[A-Za-z0-9-]{3,40}")String reference,
        @NotBlank @Size(max=120)String name,@NotNull @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)LocalDate eventDate,
        @NotBlank @Size(max=500)String location){}
    public record Requirement(@NotNull Area area,@NotNull Category category,@Min(1) @Max(100)int requiredCount,
        @NotNull @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME)LocalDateTime startsAt,
        @NotNull @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME)LocalDateTime endsAt,@Size(max=1000)String notes){}
    public record Assign(@NotEmpty Set<Long> staffIds){}
    public record Reason(@NotBlank @Size(max=1000)String notes){}
    public record Staff(@NotBlank @Size(max=120)String name,@NotNull Category category,
        @Size(max=120)String contact,boolean active,@Email @Size(max=254)String email,@Size(max=64)String password){}
    public record Available(@NotNull Long staffId,
        @NotNull @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME)LocalDateTime startsAt,
        @NotNull @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME)LocalDateTime endsAt,
        boolean available,@Size(max=500)String notes){}
}

