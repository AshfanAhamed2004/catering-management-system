package com.joy.catering.repo;

import com.joy.catering.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long>, JpaSpecificationExecutor<Feedback> {
    Optional<Feedback> findByBookingId(Long bookingId);
    List<Feedback> findByCustomerIdOrderByCreatedAtDescIdDesc(Long customerId);
    boolean existsByBookingId(Long bookingId);
}
