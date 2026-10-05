package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.ScheduleInput;
import com.joy.catering.dto.Dtos.ScheduleUpdate;
import com.joy.catering.model.*;
import com.joy.catering.repo.BookingRepository;
import com.joy.catering.repo.StaffScheduleRepository;
import com.joy.catering.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SchedulingServiceTest {

    @Mock
    private StaffScheduleRepository scheduleRepo;
    
    @Mock
    private BookingRepository bookingRepo;
    
    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private SchedulingService schedulingService;

    private Booking booking;
    private User staff;

    @BeforeEach
    void setUp() {
        booking = new Booking();
        booking.setId(10L);
        booking.setStatus(BookingStatus.APPROVED);

        staff = new User();
        staff.setId(1L);
        staff.setRole(Role.HEAD_CHEF);
        staff.setActive(true);
    }

    @Test
    void createSchedule_success() {
        when(bookingRepo.findById(10L)).thenReturn(Optional.of(booking));
        when(userRepo.findById(1L)).thenReturn(Optional.of(staff));
        when(scheduleRepo.countOverlappingShifts(eq(1L), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), isNull())).thenReturn(0L);
        when(scheduleRepo.save(any(StaffSchedule.class))).thenAnswer(i -> i.getArguments()[0]);

        ScheduleInput input = new ScheduleInput(10L, 1L, LocalDate.now(), LocalTime.of(10, 0), LocalTime.of(14, 0), "Test");
        StaffSchedule res = schedulingService.createSchedule(input);

        assertNotNull(res);
        assertEquals(StaffScheduleStatus.SCHEDULED, res.getStatus());
        assertEquals("Test", res.getNotes());
    }

    @Test
    void createSchedule_failsIfBookingCancelled() {
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepo.findById(10L)).thenReturn(Optional.of(booking));

        ScheduleInput input = new ScheduleInput(10L, 1L, LocalDate.now(), LocalTime.of(10, 0), LocalTime.of(14, 0), "");
        ApiException ex = assertThrows(ApiException.class, () -> schedulingService.createSchedule(input));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void createSchedule_failsIfStaffInactive() {
        staff.setActive(false);
        when(bookingRepo.findById(10L)).thenReturn(Optional.of(booking));
        when(userRepo.findById(1L)).thenReturn(Optional.of(staff));

        ScheduleInput input = new ScheduleInput(10L, 1L, LocalDate.now(), LocalTime.of(10, 0), LocalTime.of(14, 0), "");
        ApiException ex = assertThrows(ApiException.class, () -> schedulingService.createSchedule(input));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void createSchedule_failsIfStaffIsCustomer() {
        staff.setRole(Role.CUSTOMER);
        when(bookingRepo.findById(10L)).thenReturn(Optional.of(booking));
        when(userRepo.findById(1L)).thenReturn(Optional.of(staff));

        ScheduleInput input = new ScheduleInput(10L, 1L, LocalDate.now(), LocalTime.of(10, 0), LocalTime.of(14, 0), "");
        ApiException ex = assertThrows(ApiException.class, () -> schedulingService.createSchedule(input));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void createSchedule_failsIfOverlapping() {
        when(bookingRepo.findById(10L)).thenReturn(Optional.of(booking));
        when(userRepo.findById(1L)).thenReturn(Optional.of(staff));
        when(scheduleRepo.countOverlappingShifts(eq(1L), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), isNull())).thenReturn(1L);

        ScheduleInput input = new ScheduleInput(10L, 1L, LocalDate.now(), LocalTime.of(10, 0), LocalTime.of(14, 0), "");
        ApiException ex = assertThrows(ApiException.class, () -> schedulingService.createSchedule(input));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void createSchedule_failsIfInvalidTime() {
        when(bookingRepo.findById(10L)).thenReturn(Optional.of(booking));
        when(userRepo.findById(1L)).thenReturn(Optional.of(staff));

        ScheduleInput input = new ScheduleInput(10L, 1L, LocalDate.now(), LocalTime.of(14, 0), LocalTime.of(10, 0), "");
        ApiException ex = assertThrows(ApiException.class, () -> schedulingService.createSchedule(input));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void updateSchedule_success() {
        StaffSchedule schedule = new StaffSchedule();
        schedule.setId(100L);
        schedule.setBooking(booking);
        schedule.setStaff(staff);
        
        when(scheduleRepo.findById(100L)).thenReturn(Optional.of(schedule));
        when(scheduleRepo.countOverlappingShifts(eq(1L), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), eq(100L))).thenReturn(0L);
        when(scheduleRepo.save(any(StaffSchedule.class))).thenAnswer(i -> i.getArguments()[0]);

        ScheduleUpdate update = new ScheduleUpdate(LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(12, 0), StaffScheduleStatus.COMPLETED, "Done");
        StaffSchedule res = schedulingService.updateSchedule(100L, update);

        assertEquals(StaffScheduleStatus.COMPLETED, res.getStatus());
        assertEquals("Done", res.getNotes());
        assertEquals(LocalTime.of(9, 0), res.getStartTime());
    }

    @Test
    void testGetStaffOptions() {
        schedulingService.getStaffOptions();
        verify(userRepo).findByRoleNotAndActiveTrueOrderByIdAsc(Role.CUSTOMER);
    }

    @Test
    void testGetBookingOptions() {
        schedulingService.getBookingOptions();
        verify(bookingRepo).findByStatusNotInOrderByCreatedAtDescIdDesc(java.util.List.of(BookingStatus.CANCELLED, BookingStatus.REJECTED));
    }
}
