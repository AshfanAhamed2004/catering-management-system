package com.smartserve.staff.repository;
import com.smartserve.staff.entity.ScheduleNotice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface NoticeRepository extends JpaRepository<ScheduleNotice,Long> {
List<ScheduleNotice> findAllByOrderByPublishedAtDescIdAsc();
List<ScheduleNotice> findByAssignmentStaffUserIdOrderByStartsAtAsc(Long id);
List<ScheduleNotice> findByAssignmentRequirementScheduleIdOrderByStaffNameAsc(Long id);
}

