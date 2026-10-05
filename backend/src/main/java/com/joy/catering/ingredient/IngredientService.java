package com.joy.catering.ingredient;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service class handling CRUD operations and Forecasting logic for Ingredients.
 */
@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public IngredientService(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    // ================= CRUD OPERATIONS =================

    /**
     * READ: Get all ingredients.
     */
    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    /**
     * READ: Get a single ingredient by ID.
     */
    public Optional<Ingredient> getIngredientById(Long id) {
        return ingredientRepository.findById(id);
    }

    /**
     * CREATE: Add a new ingredient.
     */
    public Ingredient createIngredient(Ingredient ingredient) {
        return ingredientRepository.save(ingredient);
    }

    /**
     * UPDATE: Update an existing ingredient's details.
     */
    public Ingredient updateIngredient(Long id, Ingredient updatedDetails) {
        return ingredientRepository.findById(id).map(existing -> {
            existing.setName(updatedDetails.getName());
            existing.setUnit(updatedDetails.getUnit());
            existing.setStockQuantity(updatedDetails.getStockQuantity());
            existing.setQuantityPerGuest(updatedDetails.getQuantityPerGuest());
            return ingredientRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Ingredient not found with id: " + id));
    }

    /**
     * DELETE: Delete an ingredient by ID.
     */
    public void deleteIngredient(Long id) {
        ingredientRepository.deleteById(id);
    }

    // ================= FORECASTING CALCULATION =================

    /**
     * Calculates the required quantity of each ingredient based on guest count.
     * Formula: Required Quantity = guestCount * quantityPerGuest
     */
    public Map<String, Double> calculateRequiredIngredients(int guestCount) {
        Map<String, Double> forecast = new LinkedHashMap<>();

        if (guestCount <= 0) {
            return forecast;
        }

        List<Ingredient> ingredients = ingredientRepository.findAll();

        if (!ingredients.isEmpty()) {
            for (Ingredient ingredient : ingredients) {
                double required = guestCount * ingredient.getQuantityPerGuest();
                forecast.put(ingredient.getName() + " (" + ingredient.getUnit() + ")", required);
            }
        } else {
            // Default sample proportions if database is empty
            forecast.put("Basmati Rice (kg)", guestCount * 0.15);
            forecast.put("Fresh Chicken (kg)", guestCount * 0.20);
            forecast.put("Mixed Vegetables (kg)", guestCount * 0.10);
        }

        return forecast;
    }

    /**
     * Alias method for backward compatibility.
     */
    public Map<String, Double> generateEventForecast(int guestCount) {
        return calculateRequiredIngredients(guestCount);
    }
}
