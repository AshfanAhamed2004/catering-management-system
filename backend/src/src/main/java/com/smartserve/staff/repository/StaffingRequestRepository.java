package com.smartserve.staff.repository;
import com.smartserve.staff.entity.StaffingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface StaffingRequestRepository extends JpaRepository<StaffingRequest,Long> {
List<StaffingRequest> findByRequirementIdOrderByRequestedAtDesc(Long id);
List<StaffingRequest> findAllByOrderByRequestedAtDesc();
}

