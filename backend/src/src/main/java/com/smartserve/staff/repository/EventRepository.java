package com.smartserve.staff.repository;
import com.smartserve.staff.entity.SchedulingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface EventRepository extends JpaRepository<SchedulingEvent,Long> {
boolean existsByReference(String reference);
}

