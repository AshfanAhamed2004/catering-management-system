package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.ForecastItemOut;
import com.joy.catering.dto.Dtos.ForecastOut;
import com.joy.catering.model.Booking;
import com.joy.catering.model.BookingStatus;
import com.joy.catering.model.IngredientRequirement;
import com.joy.catering.model.MenuItem;
import com.joy.catering.model.PackageEntity;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.IngredientRequirementRepository;
import com.joy.catering.repo.PackageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ForecastService {

    private final BookingRepository bookingRepo;
    private final PackageRepository packageRepo;
    private final IngredientRequirementRepository reqRepo;

    public ForecastService(BookingRepository bookingRepo, PackageRepository packageRepo, IngredientRequirementRepository reqRepo) {
        this.bookingRepo = bookingRepo;
        this.packageRepo = packageRepo;
        this.reqRepo = reqRepo;
    }

    @Transactional(readOnly = true)
    public ForecastOut getBookingForecast(Long bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot forecast for cancelled or rejected bookings");
        }

        if (booking.getPackageEntity() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Booking does not have a package assigned");
        }

        if (booking.getGuestCount() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Guest count must be greater than zero for forecasting");
        }

        List<ForecastItemOut> items = calculateItems(booking.getPackageEntity().getMenuItems(), booking.getGuestCount());

        return new ForecastOut(
                booking.getId(),
                booking.getReference(),
                booking.getPackageEntity().getId(),
                booking.getPackageEntity().getName(),
                booking.getEventDate(),
                booking.getGuestCount(),
                items
        );
    }

    @Transactional(readOnly = true)
    public ForecastOut getCustomForecast(Long packageId, int guestCount) {
        PackageEntity packageEntity = packageRepo.findById(packageId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));

        if (guestCount <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Guest count must be greater than zero for forecasting");
        }

        List<ForecastItemOut> items = calculateItems(packageEntity.getMenuItems(), guestCount);

        return new ForecastOut(
                null,
                null,
                packageEntity.getId(),
                packageEntity.getName(),
                null,
                guestCount,
                items
        );
    }

    private List<ForecastItemOut> calculateItems(List<MenuItem> menuItems, int guestCount) {
        BigDecimal guests = BigDecimal.valueOf(guestCount);
        Map<String, ItemBuilder> map = new HashMap<>();

        for (MenuItem menuItem : menuItems) {
            List<IngredientRequirement> reqs = reqRepo.findByMenuItemIdOrderByIngredientNameAsc(menuItem.getId());
            for (IngredientRequirement req : reqs) {
                String key = req.getIngredientName() + "|" + req.getUnit();
                ItemBuilder builder = map.computeIfAbsent(key, k -> new ItemBuilder(req.getIngredientName(), req.getUnit()));
                builder.addQuantity(req.getQuantityPerGuest());
                builder.addMenuItem(menuItem.getName());
            }
        }

        return map.values().stream()
                .map(b -> {
                    BigDecimal required = b.totalPerGuest.multiply(guests);
                    return new ForecastItemOut(b.name, b.unit, b.totalPerGuest, required, new ArrayList<>(b.contributors));
                })
                .sorted(Comparator.comparing(ForecastItemOut::ingredientName).thenComparing(ForecastItemOut::unit))
                .collect(Collectors.toList());
    }

    private static class ItemBuilder {
        String name;
        String unit;
        BigDecimal totalPerGuest = BigDecimal.ZERO;
        Set<String> contributors = new LinkedHashSet<>();

        ItemBuilder(String name, String unit) {
            this.name = name;
            this.unit = unit;
        }

        void addQuantity(BigDecimal qty) {
            this.totalPerGuest = this.totalPerGuest.add(qty);
        }

        void addMenuItem(String menuName) {
            this.contributors.add(menuName);
        }
    }
}
