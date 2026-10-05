package com.smartserve.staff.repository;

import com.smartserve.staff.entity.EventResourceAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResourceAllocationRepository extends JpaRepository<EventResourceAllocation, Long> {
    List<EventResourceAllocation> findByEventId(Long eventId);
    List<EventResourceAllocation> findByResourceId(Long resourceId);
    Optional<EventResourceAllocation> findByEventIdAndResourceId(Long eventId, Long resourceId);
}
