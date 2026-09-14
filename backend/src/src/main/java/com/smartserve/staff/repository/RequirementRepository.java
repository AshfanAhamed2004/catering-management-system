package com.smartserve.staff.repository;
import com.smartserve.staff.entity.StaffRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RequirementRepository extends JpaRepository<StaffRequirement,Long> {
List<StaffRequirement> findByScheduleIdOrderByAreaAscCategoryAscStartsAtAsc(Long id);
}

