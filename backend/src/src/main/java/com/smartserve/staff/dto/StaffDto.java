package com.smartserve.staff.dto;

import com.smartserve.staff.entity.Category;

public final class StaffDto {
    private StaffDto() {}

    public record StaffResponse(
        Long id,
        String name,
        Category category,
        String contact,
        boolean active,
        String email,
        Long userId
    ) {}
}
