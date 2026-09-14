package com.joy.catering.ingredient;

import java.util.HashMap;
import java.util.Map;

public class IngredientService {

    /**
     * Calculates required ingredient quantities based on expected guest count.
     *
     * @param ingredientName Name of the ingredient (e.g., Rice, Chicken)
     * @param baseAmountPerGuest Quantity needed per single guest (in kg or units)
     * @param guestCount Total number of guests expected
     * @return Total quantity needed for the event
     */
    public double calculateRequiredQuantity(String ingredientName, double baseAmountPerGuest, int guestCount) {
        if (guestCount <= 0 || baseAmountPerGuest <= 0) {
            return 0.0;
        }
        return baseAmountPerGuest * guestCount;
    }

    /**
     * Generates a sample forecast map for standard event items.
     */
    public Map<String, Double> generateEventForecast(int guestCount) {
        Map<String, Double> forecastMap = new HashMap<>();

        // Base proportions per guest (e.g., 0.15 kg rice, 0.20 kg chicken per person)
        forecastMap.put("Rice (kg)", calculateRequiredQuantity("Rice", 0.15, guestCount));
        forecastMap.put("Chicken (kg)", calculateRequiredQuantity("Chicken", 0.20, guestCount));
        forecastMap.put("Vegetables (kg)", calculateRequiredQuantity("Vegetables", 0.10, guestCount));

        return forecastMap;
    }
}
