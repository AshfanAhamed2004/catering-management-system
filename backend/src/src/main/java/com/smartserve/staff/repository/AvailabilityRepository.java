package com.smartserve.staff.repository;
import com.smartserve.staff.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AvailabilityRepository extends JpaRepository<Availability,Long> {
List<Availability> findByStaffIdOrderByStartsAtAsc(Long id);
}

