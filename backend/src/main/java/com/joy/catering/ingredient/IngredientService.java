package com.joy.catering.ingredient;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Service class handling business logic for Ingredient Forecasting.
 */
@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public IngredientService(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    /**
     * Calculates the required quantity of each ingredient based on guest count.
     * Formula: Required Quantity = guestCount * quantityPerGuest
     *
     * @param guestCount Total number of guests expected
     * @return Map of ingredient name -> total required quantity
     */
    public Map<String, Double> calculateRequiredIngredients(int guestCount) {
        Map<String, Double> forecast = new LinkedHashMap<>();

        if (guestCount <= 0) {
            return forecast;
        }

        List<Ingredient> ingredients = ingredientRepository.findAll();

        if (!ingredients.isEmpty()) {
            // Calculate using database ingredients
            for (Ingredient ingredient : ingredients) {
                double required = guestCount * ingredient.getQuantityPerGuest();
                forecast.put(ingredient.getName() + " (" + ingredient.getUnit() + ")", required);
            }
        } else {
            // Default sample proportions if the database is not yet populated
            forecast.put("Rice (kg)", guestCount * 0.15);
            forecast.put("Chicken (kg)", guestCount * 0.20);
            forecast.put("Vegetables (kg)", guestCount * 0.10);
        }

        return forecast;
    }

    /**
     * Alias method for backward compatibility with existing calls.
     */
    public Map<String, Double> generateEventForecast(int guestCount) {
        return calculateRequiredIngredients(guestCount);
    }
}
