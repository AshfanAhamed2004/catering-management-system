package com.smartserve.staff.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDateTime;

public final class AvailabilityDto {
    private AvailabilityDto() {}

    public record AvailabilityCreateRequest(
        Long staffId,
        @NotNull LocalDateTime startsAt,
        @NotNull LocalDateTime endsAt,
        boolean available,
        @Size(max = 500) String notes
    ) {}

    public record AvailabilityUpdateRequest(
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        Boolean available,
        @Size(max = 500) String notes
    ) {}

    public record AvailabilityResponse(
        Long id,
        Long staffId,
        String staffName,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        boolean available,
        String notes,
        Instant createdAt,
        Instant updatedAt
    ) {}
}
