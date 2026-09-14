package com.joy.catering.ingredient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Data access layer for Ingredients.
 */
@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
}
