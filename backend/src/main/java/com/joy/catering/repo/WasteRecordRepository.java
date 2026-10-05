package com.joy.catering.repo;

import com.joy.catering.model.WasteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

public interface WasteRecordRepository extends JpaRepository<WasteRecord, Long> {
    List<WasteRecord> findAllByOrderByWasteDateDescIdDesc();
    
    @Query("SELECT w FROM WasteRecord w WHERE " +
           "(:bookingId IS NULL OR w.booking.id = :bookingId) AND " +
           "(:startDate IS NULL OR w.wasteDate >= :startDate) AND " +
           "(:endDate IS NULL OR w.wasteDate <= :endDate) " +
           "ORDER BY w.wasteDate DESC, w.id DESC")
    List<WasteRecord> findWithFilters(@Param("bookingId") Long bookingId, 
                                      @Param("startDate") LocalDate startDate, 
                                      @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(w.quantity) FROM WasteRecord w")
    BigDecimal getTotalWasteQuantity();

    @Query("SELECT w.ingredientName, SUM(w.quantity) FROM WasteRecord w GROUP BY w.ingredientName")
    List<Object[]> getWasteQuantityByIngredient();

    @Query("SELECT w.category, SUM(w.quantity) FROM WasteRecord w GROUP BY w.category")
    List<Object[]> getWasteQuantityByCategory();
}
