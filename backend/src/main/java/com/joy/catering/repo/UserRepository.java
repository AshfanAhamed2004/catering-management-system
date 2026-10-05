package com.joy.catering.repo; 
import com.joy.catering.model.User; 
import java.util.*; 
import java.time.OffsetDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User,Long>{
    Optional<User> findByEmail(String email); 
    List<User> findAllByOrderByIdAsc(); 
    List<User> findByRoleNotAndActiveTrueOrderByIdAsc(com.joy.catering.model.Role role);

    interface CustomerSummaryProjection {
        Long getId();
        String getFullName();
        String getEmail();
        String getMobileNumber();
        Boolean getActive();
        Long getTotalBookings();
        OffsetDateTime getCreatedAt();
    }

    @Query("SELECT u.id as id, p.fullName as fullName, u.email as email, p.mobileNumber as mobileNumber, u.active as active, COUNT(b.id) as totalBookings, u.createdAt as createdAt " +
           "FROM User u " +
           "LEFT JOIN u.profile p " +
           "LEFT JOIN Booking b ON b.customer = u " +
           "WHERE u.role = 'CUSTOMER' " +
           "AND (:search IS NULL OR " +
           "LOWER(p.fullName) LIKE :search OR " +
           "LOWER(u.email) LIKE :search OR " +
           "p.mobileNumber LIKE :search) " +
           "GROUP BY u.id, p.fullName, u.email, p.mobileNumber, u.active, u.createdAt " +
           "ORDER BY u.createdAt DESC, u.id DESC")
    List<CustomerSummaryProjection> searchCustomers(@Param("search") String search);
}