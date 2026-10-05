package com.joy.catering.repo;

import com.joy.catering.model.StaffSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Long> {
    
    List<StaffSchedule> findByStaffId(Long staffId);
    List<StaffSchedule> findByBookingId(Long bookingId);
    List<StaffSchedule> findByShiftDate(LocalDate shiftDate);

    @Query("SELECT COUNT(s) FROM StaffSchedule s WHERE s.staff.id = :staffId AND s.shiftDate = :date AND s.status != 'CANCELLED' AND (s.id != :excludeId OR :excludeId IS NULL) AND (s.startTime < :end AND s.endTime > :start)")
    long countOverlappingShifts(@Param("staffId") Long staffId, @Param("date") LocalDate date, @Param("start") LocalTime start, @Param("end") LocalTime end, @Param("excludeId") Long excludeId);
}
