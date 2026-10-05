package com.joy.catering.controller;

import com.joy.catering.Mapping;
import com.joy.catering.dto.Dtos.BookingOptionOut;
import com.joy.catering.dto.Dtos.WasteInput;
import com.joy.catering.dto.Dtos.WasteOut;
import com.joy.catering.dto.Dtos.WasteSummaryOut;
import com.joy.catering.model.User;
import com.joy.catering.service.WasteService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/staff/waste")
@PreAuthorize("hasAnyRole('GENERAL_MANAGER','HEAD_CHEF','EVENT_COORDINATION_OFFICER')")
public class WasteController {

    private final WasteService wasteService;

    public WasteController(WasteService wasteService) {
        this.wasteService = wasteService;
    }

    @PostMapping
    public ResponseEntity<WasteOut> create(@Valid @RequestBody WasteInput input, Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.status(201).body(Mapping.waste(wasteService.createWaste(input, user.getEmail())));
    }

    @GetMapping
    public List<WasteOut> list(
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return wasteService.listWaste(bookingId, startDate, endDate)
                .stream().map(Mapping::waste).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public WasteOut get(@PathVariable Long id) {
        return Mapping.waste(wasteService.getWaste(id));
    }

    @PutMapping("/{id}")
    public WasteOut update(@PathVariable Long id, @Valid @RequestBody WasteInput update) {
        return Mapping.waste(wasteService.updateWaste(id, update));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        wasteService.deleteWaste(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public WasteSummaryOut summary() {
        return wasteService.getSummary();
    }

    @GetMapping("/booking-options")
    public List<BookingOptionOut> bookingOptions() {
        return wasteService.getBookingOptions().stream().map(Mapping::bookingOption).collect(Collectors.toList());
    }
}
