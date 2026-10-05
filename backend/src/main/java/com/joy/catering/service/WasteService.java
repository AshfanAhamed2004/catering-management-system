package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.WasteInput;
import com.joy.catering.dto.Dtos.WasteSummaryOut;
import com.joy.catering.model.*;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.UserRepository;
import com.joy.catering.repo.WasteRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WasteService {

    private final WasteRecordRepository wasteRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;

    public WasteService(WasteRecordRepository wasteRepo, BookingRepository bookingRepo, UserRepository userRepo) {
        this.wasteRepo = wasteRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
    }

    private String normalizeIngredientName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ingredient name cannot be blank");
        }
        String trimmed = name.trim().toLowerCase();
        return Character.toUpperCase(trimmed.charAt(0)) + (trimmed.length() > 1 ? trimmed.substring(1) : "");
    }

    private void validate(WasteInput input) {
        if (input.quantity() == null || input.quantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be strictly greater than 0");
        }
        if (input.unit() == null || input.unit().trim().isEmpty() || input.unit().length() > 30) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid unit");
        }
        if (input.wasteDate() == null || input.wasteDate().isAfter(LocalDate.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Waste date cannot be in the future");
        }
        if (input.category() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Category is required");
        }
    }

    @Transactional
    public WasteRecord createWaste(WasteInput input, String authenticatedEmail) {
        validate(input);
        String normalizedIngredient = normalizeIngredientName(input.ingredientName());

        User recorder = userRepo.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (!recorder.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Inactive user cannot record waste");
        }
        if (recorder.getRole() == Role.CUSTOMER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Customers cannot record waste");
        }

        WasteRecord record = new WasteRecord();
        record.setIngredientName(normalizedIngredient);
        record.setQuantity(input.quantity());
        record.setUnit(input.unit().trim());
        record.setCategory(input.category());
        record.setWasteDate(input.wasteDate());
        record.setRecordedBy(recorder);
        record.setNotes(input.notes());

        if (input.bookingId() != null) {
            Booking booking = bookingRepo.findById(input.bookingId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
            if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
                throw new ApiException(HttpStatus.CONFLICT, "Cannot record waste for a CANCELLED or REJECTED booking");
            }
            record.setBooking(booking);
        }

        return wasteRepo.save(record);
    }

    public List<WasteRecord> listWaste(Long bookingId, LocalDate startDate, LocalDate endDate) {
        return wasteRepo.findWithFilters(bookingId, startDate, endDate);
    }

    public WasteRecord getWaste(Long id) {
        return wasteRepo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Waste record not found"));
    }

    @Transactional
    public WasteRecord updateWaste(Long id, WasteInput update) {
        validate(update);
        String normalizedIngredient = normalizeIngredientName(update.ingredientName());
        WasteRecord record = getWaste(id);

        record.setIngredientName(normalizedIngredient);
        record.setQuantity(update.quantity());
        record.setUnit(update.unit().trim());
        record.setCategory(update.category());
        record.setWasteDate(update.wasteDate());
        record.setNotes(update.notes());

        if (update.bookingId() != null) {
            Booking booking = bookingRepo.findById(update.bookingId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
            if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
                throw new ApiException(HttpStatus.CONFLICT, "Cannot assign waste to a CANCELLED or REJECTED booking");
            }
            record.setBooking(booking);
        } else {
            record.setBooking(null);
        }

        return wasteRepo.save(record);
    }

    @Transactional
    public void deleteWaste(Long id) {
        WasteRecord record = getWaste(id);
        wasteRepo.delete(record);
    }

    public WasteSummaryOut getSummary() {
        BigDecimal total = wasteRepo.getTotalWasteQuantity();
        if (total == null) total = BigDecimal.ZERO;

        Map<String, BigDecimal> byIngredient = wasteRepo.getWasteQuantityByIngredient().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (BigDecimal) row[1]
                ));

        Map<String, BigDecimal> byCategory = wasteRepo.getWasteQuantityByCategory().stream()
                .collect(Collectors.toMap(
                        row -> ((WasteCategory) row[0]).name(),
                        row -> (BigDecimal) row[1]
                ));

        return new WasteSummaryOut(total, byIngredient, byCategory);
    }

    public List<Booking> getBookingOptions() {
        return bookingRepo.findByStatusNotInOrderByCreatedAtDescIdDesc(List.of(BookingStatus.CANCELLED, BookingStatus.REJECTED));
    }
}
