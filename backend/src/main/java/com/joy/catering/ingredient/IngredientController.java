package com.joy.catering.ingredient;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * REST Controller providing complete CRUD operations and Forecasting API for Ingredients.
 * Base URL: /api/ingredients
 */
@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    // ================= 1. READ ALL (GET /api/ingredients) =================
    @GetMapping
    public List<Ingredient> getAllIngredients() {
        return ingredientService.getAllIngredients();
    }

    // ================= 2. READ ONE (GET /api/ingredients/{id}) =================
    @GetMapping("/{id}")
    public ResponseEntity<Ingredient> getIngredientById(@PathVariable Long id) {
        return ingredientService.getIngredientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ================= 3. CREATE (POST /api/ingredients) =================
    @PostMapping
    public ResponseEntity<Ingredient> createIngredient(@RequestBody Ingredient ingredient) {
        Ingredient saved = ingredientService.createIngredient(ingredient);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ================= 4. UPDATE (PUT /api/ingredients/{id}) =================
    @PutMapping("/{id}")
    public ResponseEntity<Ingredient> updateIngredient(@PathVariable Long id, @RequestBody Ingredient ingredient) {
        try {
            Ingredient updated = ingredientService.updateIngredient(id, ingredient);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ================= 5. DELETE (DELETE /api/ingredients/{id}) =================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }

    // ================= 6. FORECASTING (GET /api/ingredients/forecast?guestCount=100) =================
    @GetMapping("/forecast")
    public Map<String, Double> getForecast(@RequestParam int guestCount) {
        return ingredientService.calculateRequiredIngredients(guestCount);
    }
}
