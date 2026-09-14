package com.joy.catering.ingredient;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST Controller exposing API endpoints for Ingredient Forecasting.
 */
@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    // Spring Boot automatically injects IngredientService here
    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    /**
     * API endpoint to get ingredient forecast for a given guest count.
     * Example URL: http://localhost:8000/api/ingredients/forecast?guestCount=100
     */
    @GetMapping("/forecast")
    public Map<String, Double> getForecast(@RequestParam int guestCount) {
        return ingredientService.calculateRequiredIngredients(guestCount);
    }
}
