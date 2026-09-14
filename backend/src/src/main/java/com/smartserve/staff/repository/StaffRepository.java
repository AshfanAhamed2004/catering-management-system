package com.smartserve.staff.repository;
import com.smartserve.staff.entity.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface StaffRepository extends JpaRepository<StaffMember,Long> {
List<StaffMember> findAllByOrderByNameAsc(); Optional<StaffMember> findByUserId(Long id);
}

