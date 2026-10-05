package com.joy.catering.repo;

import com.joy.catering.model.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Inquiry> findAllByOrderByCreatedAtDesc();
}
