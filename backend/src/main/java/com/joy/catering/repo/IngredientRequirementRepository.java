package com.joy.catering.repo;

import com.joy.catering.model.IngredientRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRequirementRepository extends JpaRepository<IngredientRequirement, Long> {
    List<IngredientRequirement> findByMenuItemIdOrderByIngredientNameAsc(Long menuItemId);
    boolean existsByMenuItemIdAndIngredientNameIgnoreCase(Long menuItemId, String ingredientName);
}
