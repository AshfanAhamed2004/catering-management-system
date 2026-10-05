package com.smartserve.staff.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;

public final class ResourceDto {
    private ResourceDto() {}

    public record ResourceCreateRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 40) String category,
        @Min(0) int quantityAvailable,
        @Size(max = 500) String notes
    ) {}

    public record ResourceResponse(
        Long resourceId,
        String name,
        String category,
        int quantityAvailable,
        String notes,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ResourceAllocationRequest(
        @NotNull Long resourceId,
        @Positive int quantityAllocated,
        @Size(max = 500) String notes
    ) {}

    public record ResourceAllocationResponse(
        Long allocationId,
        Long eventId,
        String eventReference,
        String eventName,
        Long resourceId,
        String resourceName,
        int quantityAllocated,
        String notes,
        Instant createdAt,
        Instant updatedAt
    ) {}
}
