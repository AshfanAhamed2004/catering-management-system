package com.smartserve.staff.dto;

import com.smartserve.staff.entity.Area;
import com.smartserve.staff.entity.Category;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public final class ScheduleDto {
    private ScheduleDto() {}

    public record ScheduleCreateRequest(
        @NotNull Long eventId,
        @NotNull Long staffId,
        @NotNull Category role,
        Area area,
        @NotNull LocalDate workDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @Size(max = 1000) String notes
    ) {}

    public record ScheduleUpdateRequest(
        Category role,
        Area area,
        LocalDate workDate,
        LocalTime startTime,
        LocalTime endTime,
        @Size(max = 1000) String notes
    ) {}

    public record ScheduleResponse(
        Long scheduleId,
        Long eventId,
        String eventReference,
        String eventName,
        Long staffId,
        String staffName,
        Category assignedRole,
        Area area,
        LocalDate workDate,
        LocalTime startTime,
        LocalTime endTime,
        String status,
        String notes,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record EventResponse(
        Long id,
        String reference,
        String name,
        LocalDate eventDate,
        String location
    ) {}
}
