package com.smartserve.staff.repository;
import com.smartserve.staff.entity.StaffAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AssignmentRepository extends JpaRepository<StaffAssignment,Long> {
List<StaffAssignment> findByRequirementIdOrderByStaffNameAsc(Long id);
List<StaffAssignment> findByRequirementScheduleId(Long id);
List<StaffAssignment> findByStaffId(Long id);
boolean existsByRequirementIdAndStaffId(Long requirementId,Long staffId);
}

