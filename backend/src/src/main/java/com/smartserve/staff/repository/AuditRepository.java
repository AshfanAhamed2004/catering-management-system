package com.smartserve.staff.repository;
import com.smartserve.staff.entity.ScheduleAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AuditRepository extends JpaRepository<ScheduleAudit,Long> {
List<ScheduleAudit> findByScheduleIdOrderByOccurredAtAscIdAsc(Long id);
}

