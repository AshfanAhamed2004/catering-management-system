package com.joy.catering.ingredient;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController() {
        this.ingredientService = new IngredientService();
    }

    @GetMapping("/forecast")
    public Map<String, Double> getForecast(@RequestParam int guestCount) {
        return ingredientService.generateEventForecast(guestCount);
    }
}
