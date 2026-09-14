package com.smartserve.staff.repository;

import com.smartserve.staff.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findAllByOrderByNameAsc();
    Optional<Resource> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
