package com.joy.catering.controller;

import com.joy.catering.dto.Dtos.ForecastOut;
import com.joy.catering.service.ForecastService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/staff/forecast")
@PreAuthorize("hasAnyRole('HEAD_CHEF','GENERAL_MANAGER')")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @GetMapping
    public ForecastOut getBookingForecast(@RequestParam Long bookingId) {
        return forecastService.getBookingForecast(bookingId);
    }

    @GetMapping("/custom")
    public ForecastOut getCustomForecast(@RequestParam Long packageId, @RequestParam int guestCount) {
        return forecastService.getCustomForecast(packageId, guestCount);
    }
}
