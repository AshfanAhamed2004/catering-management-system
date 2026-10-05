package com.joy.catering.controller;

import com.joy.catering.Mapping;
import com.joy.catering.dto.Dtos.*;
import com.joy.catering.model.StaffSchedule;
import com.joy.catering.service.SchedulingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/staff/schedules")
@PreAuthorize("hasAnyRole('GENERAL_MANAGER','EVENT_COORDINATION_OFFICER')")
public class SchedulingController {

    private final SchedulingService schedulingService;

    public SchedulingController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    @PostMapping
    public ResponseEntity<ScheduleOut> create(@Valid @RequestBody ScheduleInput input) {
        StaffSchedule schedule = schedulingService.createSchedule(input);
        return ResponseEntity.status(201).body(Mapping.schedule(schedule));
    }

    @GetMapping
    public List<ScheduleOut> list(
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) Long staffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return schedulingService.listSchedules(bookingId, staffId, date)
                .stream().map(Mapping::schedule).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ScheduleOut get(@PathVariable Long id) {
        return Mapping.schedule(schedulingService.getSchedule(id));
    }

    @PutMapping("/{id}")
    public ScheduleOut update(@PathVariable Long id, @Valid @RequestBody ScheduleUpdate update) {
        return Mapping.schedule(schedulingService.updateSchedule(id, update));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        schedulingService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/staff-options")
    public List<StaffOptionOut> getStaffOptions() {
        return schedulingService.getStaffOptions().stream().map(Mapping::staffOption).collect(Collectors.toList());
    }

    @GetMapping("/booking-options")
    public List<BookingOptionOut> getBookingOptions() {
        return schedulingService.getBookingOptions().stream().map(Mapping::bookingOption).collect(Collectors.toList());
    }
}
