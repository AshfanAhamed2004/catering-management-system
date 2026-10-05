package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.IngredientRequirementInput;
import com.joy.catering.model.IngredientRequirement;
import com.joy.catering.model.MenuItem;
import com.joy.catering.repo.IngredientRequirementRepository;
import com.joy.catering.repo.MenuItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class IngredientRequirementService {

    private final IngredientRequirementRepository reqRepo;
    private final MenuItemRepository menuRepo;

    public IngredientRequirementService(IngredientRequirementRepository reqRepo, MenuItemRepository menuRepo) {
        this.reqRepo = reqRepo;
        this.menuRepo = menuRepo;
    }

    public List<IngredientRequirement> getRequirements(Long menuItemId) {
        if (!menuRepo.existsById(menuItemId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Menu item not found");
        }
        return reqRepo.findByMenuItemIdOrderByIngredientNameAsc(menuItemId);
    }

    @Transactional
    public IngredientRequirement createRequirement(Long menuItemId, IngredientRequirementInput input) {
        if (input.ingredientName() == null || input.ingredientName().trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ingredient name cannot be blank");
        }
        if (input.quantityPerGuest() == null || input.quantityPerGuest().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero");
        }
        if (input.unit() == null || input.unit().trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unit cannot be blank");
        }

        String normalizedName = normalize(input.ingredientName());

        MenuItem menuItem = menuRepo.findById(menuItemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Menu item not found"));

        if (reqRepo.existsByMenuItemIdAndIngredientNameIgnoreCase(menuItemId, normalizedName)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ingredient requirement already exists for this menu item");
        }

        IngredientRequirement req = new IngredientRequirement();
        req.setMenuItem(menuItem);
        req.setIngredientName(normalizedName);
        req.setQuantityPerGuest(input.quantityPerGuest());
        req.setUnit(input.unit().trim());

        return reqRepo.save(req);
    }

    @Transactional
    public void deleteRequirement(Long id) {
        if (!reqRepo.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Ingredient requirement not found");
        }
        reqRepo.deleteById(id);
    }

    private String normalize(String name) {
        String trimmed = name.trim();
        if (trimmed.isEmpty()) return trimmed;
        return Character.toUpperCase(trimmed.charAt(0)) + trimmed.substring(1).toLowerCase();
    }
}
