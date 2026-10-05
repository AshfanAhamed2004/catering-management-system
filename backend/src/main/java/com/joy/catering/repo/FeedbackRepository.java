package com.joy.catering.repo;

import com.joy.catering.model.Feedback;
import com.joy.catering.model.FeedbackCategory;
import com.joy.catering.model.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long>, JpaSpecificationExecutor<Feedback> {
    Optional<Feedback> findByBookingId(Long bookingId);
    List<Feedback> findByCustomerIdOrderByCreatedAtDescIdDesc(Long customerId);
    boolean existsByBookingId(Long bookingId);

    interface CustomerFeedbackFlatProjection {
        Long getId();
        String getBookingReference();
        Integer getRating();
        String getComment();
        String getStaffResponse();
        FeedbackStatus getStatus();
        OffsetDateTime getCreatedAt();
        FeedbackCategory getCategory();
    }

    @Query("SELECT f.id as id, b.reference as bookingReference, f.rating as rating, " +
           "f.comment as comment, f.staffResponse as staffResponse, f.status as status, " +
           "f.createdAt as createdAt, c as category " +
           "FROM Feedback f " +
           "LEFT JOIN f.booking b " +
           "LEFT JOIN f.categories c " +
           "WHERE f.customer.id = :customerId " +
           "ORDER BY f.createdAt DESC, f.id DESC")
    List<CustomerFeedbackFlatProjection> findFlatHistoryByCustomerId(@Param("customerId") Long customerId);
}