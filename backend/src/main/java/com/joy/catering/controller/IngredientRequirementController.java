package com.joy.catering.controller;

import com.joy.catering.Mapping;
import com.joy.catering.dto.Dtos.IngredientRequirementInput;
import com.joy.catering.dto.Dtos.IngredientRequirementOut;
import com.joy.catering.service.IngredientRequirementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@PreAuthorize("hasAnyRole('HEAD_CHEF','GENERAL_MANAGER')")
public class IngredientRequirementController {

    private final IngredientRequirementService reqService;

    public IngredientRequirementController(IngredientRequirementService reqService) {
        this.reqService = reqService;
    }

    @GetMapping("/staff/menu-items/{menuItemId}/ingredients")
    public List<IngredientRequirementOut> getIngredients(@PathVariable Long menuItemId) {
        return reqService.getRequirements(menuItemId)
                .stream().map(Mapping::ingredientReq).collect(Collectors.toList());
    }

    @PostMapping("/staff/menu-items/{menuItemId}/ingredients")
    public ResponseEntity<IngredientRequirementOut> createIngredient(
            @PathVariable Long menuItemId,
            @Valid @RequestBody IngredientRequirementInput input) {
        return ResponseEntity.status(201)
                .body(Mapping.ingredientReq(reqService.createRequirement(menuItemId, input)));
    }

    @DeleteMapping("/staff/ingredients/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Long id) {
        reqService.deleteRequirement(id);
        return ResponseEntity.noContent().build();
    }
}
