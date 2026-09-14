package com.smartserve.staff.repository;
import com.smartserve.staff.entity.StaffSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ScheduleRepository extends JpaRepository<StaffSchedule,Long> {
List<StaffSchedule> findAllByOrderByCreatedAtDesc();
}

