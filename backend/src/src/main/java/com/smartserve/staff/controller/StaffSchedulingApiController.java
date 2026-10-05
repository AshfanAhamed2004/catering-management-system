package com.smartserve.staff.controller;

import com.smartserve.staff.dto.*;
import com.smartserve.staff.exception.BusinessException;
import com.smartserve.staff.service.SchedulingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StaffSchedulingApiController {

    private final SchedulingService service;

    public StaffSchedulingApiController(SchedulingService service) {
        this.service = service;
    }

    // =========================================================================
    // Staff Members
    // =========================================================================

    @GetMapping("/staff")
    public ResponseEntity<List<StaffDto.StaffResponse>> getStaff() {
        return ResponseEntity.ok(service.getStaffMembers());
    }

    @GetMapping("/staff/{id}")
    public ResponseEntity<StaffDto.StaffResponse> getStaffMember(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStaffMember(id));
    }

    // =========================================================================
    // Staff Availability
    // =========================================================================

    @GetMapping("/staff/{id}/availability")
    public ResponseEntity<List<AvailabilityDto.AvailabilityResponse>> getAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStaffAvailabilityList(id));
    }

    @PostMapping("/staff/{id}/availability")
    public ResponseEntity<AvailabilityDto.AvailabilityResponse> addAvailability(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityDto.AvailabilityCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addAvailability(id, request));
    }

    @PutMapping("/staff/{id}/availability/{availabilityId}")
    public ResponseEntity<AvailabilityDto.AvailabilityResponse> updateAvailability(
            @PathVariable Long id,
            @PathVariable Long availabilityId,
            @Valid @RequestBody AvailabilityDto.AvailabilityUpdateRequest request) {
        return ResponseEntity.ok(service.updateAvailabilityRecord(id, availabilityId, request));
    }

    @DeleteMapping("/staff/{id}/availability/{availabilityId}")
    public ResponseEntity<Void> deleteAvailability(
            @PathVariable Long id,
            @PathVariable Long availabilityId) {
        service.deleteAvailabilityRecord(id, availabilityId);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // Schedules / Rosters
    // =========================================================================

    @GetMapping("/schedules")
    public ResponseEntity<List<ScheduleDto.ScheduleResponse>> getSchedules(
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) Long staffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate,
            @RequestParam(required = false) String month) {
        YearMonth yearMonth = null;
        if (month != null && !month.isBlank()) {
            try {
                yearMonth = YearMonth.parse(month.strip());
            } catch (DateTimeParseException e) {
                throw BusinessException.invalid("Choose a valid calendar month (e.g., YYYY-MM).");
            }
        }
        return ResponseEntity.ok(service.querySchedules(eventId, staffId, workDate, yearMonth));
    }

    @GetMapping("/schedules/{id}")
    public ResponseEntity<ScheduleDto.ScheduleResponse> getSchedule(@PathVariable Long id) {
        return ResponseEntity.ok(service.getScheduleItem(id));
    }

    @PostMapping("/schedules")
    public ResponseEntity<ScheduleDto.ScheduleResponse> createSchedule(
            @Valid @RequestBody ScheduleDto.ScheduleCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createScheduleItem(request));
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<ScheduleDto.ScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleDto.ScheduleUpdateRequest request) {
        return ResponseEntity.ok(service.updateScheduleItem(id, request));
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        service.deleteScheduleItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events/{eventId}/schedules")
    public ResponseEntity<List<ScheduleDto.ScheduleResponse>> getEventSchedules(@PathVariable Long eventId) {
        return ResponseEntity.ok(service.getEventSchedules(eventId));
    }

    @GetMapping("/staff/{staffId}/schedules")
    public ResponseEntity<List<ScheduleDto.ScheduleResponse>> getStaffSchedules(@PathVariable Long staffId) {
        return ResponseEntity.ok(service.getStaffSchedules(staffId));
    }

    // =========================================================================
    // Resources & Resource Allocation
    // =========================================================================

    @GetMapping("/resources")
    public ResponseEntity<List<ResourceDto.ResourceResponse>> getResources() {
        return ResponseEntity.ok(service.listResources());
    }

    @PostMapping("/resources")
    public ResponseEntity<ResourceDto.ResourceResponse> createResource(
            @Valid @RequestBody ResourceDto.ResourceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createResource(request));
    }

    @GetMapping("/events/{eventId}/resources")
    public ResponseEntity<List<ResourceDto.ResourceAllocationResponse>> getEventResources(@PathVariable Long eventId) {
        return ResponseEntity.ok(service.listEventResources(eventId));
    }

    @PostMapping("/events/{eventId}/resources")
    public ResponseEntity<ResourceDto.ResourceAllocationResponse> allocateResource(
            @PathVariable Long eventId,
            @Valid @RequestBody ResourceDto.ResourceAllocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.allocateResource(eventId, request));
    }

    @DeleteMapping("/events/{eventId}/resources/{allocationId}")
    public ResponseEntity<Void> removeResourceAllocation(
            @PathVariable Long eventId,
            @PathVariable Long allocationId) {
        service.removeResourceAllocation(eventId, allocationId);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // Events & Profile Endpoints
    // =========================================================================

    @GetMapping("/events")
    public ResponseEntity<List<ScheduleDto.EventResponse>> getEvents() {
        return ResponseEntity.ok(service.getEvents());
    }

    @GetMapping("/staff/me")
    public ResponseEntity<StaffDto.StaffResponse> getCurrentStaffProfile() {
        return ResponseEntity.ok(service.getCurrentStaffProfile());
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        return ResponseEntity.ok(service.getCurrentUserSession());
    }
}
