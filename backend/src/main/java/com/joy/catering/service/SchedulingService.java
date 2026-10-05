package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.ScheduleInput;
import com.joy.catering.dto.Dtos.ScheduleUpdate;
import com.joy.catering.model.*;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.StaffScheduleRepository;
import com.joy.catering.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SchedulingService {

    private final StaffScheduleRepository scheduleRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;

    public SchedulingService(StaffScheduleRepository scheduleRepo, BookingRepository bookingRepo, UserRepository userRepo) {
        this.scheduleRepo = scheduleRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
    }

    private void validateTimeAndOverlap(Long staffId, LocalDate shiftDate, java.time.LocalTime start, java.time.LocalTime end, Long excludeId) {
        if (!start.isBefore(end)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }
        long overlap = scheduleRepo.countOverlappingShifts(staffId, shiftDate, start, end, excludeId);
        if (overlap > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Staff member already has an overlapping shift on this date");
        }
    }

    @Transactional
    public StaffSchedule createSchedule(ScheduleInput input) {
        Booking booking = bookingRepo.findById(input.bookingId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot schedule staff for CANCELLED or REJECTED bookings");
        }

        User staff = userRepo.findById(input.staffId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff member not found"));

        if (!staff.isActive()) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot assign an inactive staff member");
        }
        if (staff.getRole() == Role.CUSTOMER) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot assign a CUSTOMER to a staff schedule");
        }

        validateTimeAndOverlap(staff.getId(), input.shiftDate(), input.startTime(), input.endTime(), null);

        StaffSchedule schedule = new StaffSchedule();
        schedule.setBooking(booking);
        schedule.setStaff(staff);
        schedule.setShiftDate(input.shiftDate());
        schedule.setStartTime(input.startTime());
        schedule.setEndTime(input.endTime());
        schedule.setNotes(input.notes());
        schedule.setStatus(StaffScheduleStatus.SCHEDULED);

        return scheduleRepo.save(schedule);
    }

    public List<StaffSchedule> listSchedules(Long bookingId, Long staffId, LocalDate date) {
        if (bookingId != null) return scheduleRepo.findByBookingId(bookingId);
        if (staffId != null) return scheduleRepo.findByStaffId(staffId);
        if (date != null) return scheduleRepo.findByShiftDate(date);
        return scheduleRepo.findAll();
    }

    public StaffSchedule getSchedule(Long id) {
        return scheduleRepo.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Schedule not found"));
    }

    @Transactional
    public StaffSchedule updateSchedule(Long id, ScheduleUpdate update) {
        StaffSchedule schedule = getSchedule(id);

        if (schedule.getBooking().getStatus() == BookingStatus.CANCELLED || schedule.getBooking().getStatus() == BookingStatus.REJECTED) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot update schedule for CANCELLED or REJECTED bookings");
        }

        validateTimeAndOverlap(schedule.getStaff().getId(), update.shiftDate(), update.startTime(), update.endTime(), schedule.getId());

        schedule.setShiftDate(update.shiftDate());
        schedule.setStartTime(update.startTime());
        schedule.setEndTime(update.endTime());
        if (update.status() != null) {
            schedule.setStatus(update.status());
        }
        schedule.setNotes(update.notes());

        return scheduleRepo.save(schedule);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        StaffSchedule schedule = getSchedule(id);
        scheduleRepo.delete(schedule);
    }

    public List<User> getStaffOptions() {
        return userRepo.findByRoleNotAndActiveTrueOrderByIdAsc(Role.CUSTOMER);
    }

    public List<Booking> getBookingOptions() {
        return bookingRepo.findByStatusNotInOrderByCreatedAtDescIdDesc(List.of(BookingStatus.CANCELLED, BookingStatus.REJECTED));
    }
}
