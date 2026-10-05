package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.controller.IngredientRequirementController;
import com.joy.catering.dto.Dtos.IngredientRequirementInput;
import com.joy.catering.model.IngredientRequirement;
import com.joy.catering.model.MenuItem;
import com.joy.catering.repo.IngredientRequirementRepository;
import com.joy.catering.repo.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class IngredientRequirementServiceTest {

    @Mock
    private IngredientRequirementRepository reqRepo;

    @Mock
    private MenuItemRepository menuRepo;

    @InjectMocks
    private IngredientRequirementService reqService;

    private MenuItem menuItem;

    @BeforeEach
    void setUp() {
        menuItem = new MenuItem();
        menuItem.setId(1L);
        menuItem.setName("Roast Beef");
    }

    @Test
    void createRequirement_success() {
        when(menuRepo.findById(1L)).thenReturn(Optional.of(menuItem));
        when(reqRepo.existsByMenuItemIdAndIngredientNameIgnoreCase(1L, "Beef")).thenReturn(false);
        when(reqRepo.save(any(IngredientRequirement.class))).thenAnswer(i -> i.getArguments()[0]);

        IngredientRequirementInput input = new IngredientRequirementInput("Beef", new BigDecimal("0.25"), "kg");
        IngredientRequirement req = reqService.createRequirement(1L, input);

        assertEquals("Beef", req.getIngredientName());
        assertEquals(new BigDecimal("0.25"), req.getQuantityPerGuest());
        assertEquals("kg", req.getUnit());
        assertEquals(menuItem, req.getMenuItem());
    }

    @Test
    void createRequirement_normalizesName() {
        when(menuRepo.findById(1L)).thenReturn(Optional.of(menuItem));
        when(reqRepo.existsByMenuItemIdAndIngredientNameIgnoreCase(1L, "Tomato")).thenReturn(false);
        when(reqRepo.save(any(IngredientRequirement.class))).thenAnswer(i -> i.getArguments()[0]);

        IngredientRequirementInput input = new IngredientRequirementInput("  tOMATO ", new BigDecimal("0.1"), "kg");
        IngredientRequirement req = reqService.createRequirement(1L, input);

        assertEquals("Tomato", req.getIngredientName());
    }

    @Test
    void createRequirement_failsIfBlankName() {
        IngredientRequirementInput input = new IngredientRequirementInput("   ", new BigDecimal("0.1"), "kg");
        ApiException ex = assertThrows(ApiException.class, () -> reqService.createRequirement(1L, input));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createRequirement_failsIfZeroQuantity() {
        IngredientRequirementInput input = new IngredientRequirementInput("Beef", BigDecimal.ZERO, "kg");
        ApiException ex = assertThrows(ApiException.class, () -> reqService.createRequirement(1L, input));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createRequirement_failsIfNegativeQuantity() {
        IngredientRequirementInput input = new IngredientRequirementInput("Beef", new BigDecimal("-1.0"), "kg");
        ApiException ex = assertThrows(ApiException.class, () -> reqService.createRequirement(1L, input));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createRequirement_failsIfBlankUnit() {
        IngredientRequirementInput input = new IngredientRequirementInput("Beef", new BigDecimal("0.1"), "  ");
        ApiException ex = assertThrows(ApiException.class, () -> reqService.createRequirement(1L, input));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createRequirement_failsIfDuplicate() {
        when(menuRepo.findById(1L)).thenReturn(Optional.of(menuItem));
        when(reqRepo.existsByMenuItemIdAndIngredientNameIgnoreCase(1L, "Beef")).thenReturn(true);

        IngredientRequirementInput input = new IngredientRequirementInput("Beef", new BigDecimal("0.25"), "kg");
        ApiException ex = assertThrows(ApiException.class, () -> reqService.createRequirement(1L, input));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void createRequirement_failsIfMissingMenu() {
        when(menuRepo.findById(99L)).thenReturn(Optional.empty());

        IngredientRequirementInput input = new IngredientRequirementInput("Beef", new BigDecimal("0.25"), "kg");
        ApiException ex = assertThrows(ApiException.class, () -> reqService.createRequirement(99L, input));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void deleteRequirement_success() {
        when(reqRepo.existsById(10L)).thenReturn(true);
        reqService.deleteRequirement(10L);
        verify(reqRepo, times(1)).deleteById(10L);
    }

    @Test
    void deleteRequirement_failsIfMissing() {
        when(reqRepo.existsById(10L)).thenReturn(false);
        ApiException ex = assertThrows(ApiException.class, () -> reqService.deleteRequirement(10L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void getRequirements_failsIfMissingMenu() {
        when(menuRepo.existsById(99L)).thenReturn(false);
        ApiException ex = assertThrows(ApiException.class, () -> reqService.getRequirements(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void verifyControllerAuthorization() {
        PreAuthorize auth = IngredientRequirementController.class.getAnnotation(PreAuthorize.class);
        assertNotNull(auth, "Controller must be secured with @PreAuthorize");
        String expr = auth.value().replace(" ", "");
        assertTrue(expr.contains("hasAnyRole("));
        assertTrue(expr.contains("'HEAD_CHEF'"));
        assertTrue(expr.contains("'GENERAL_MANAGER'"));
        assertFalse(expr.contains("'CUSTOMER'"));
        assertFalse(expr.contains("'FINANCE_OFFICER'"));
        assertFalse(expr.contains("'CUSTOMER_SERVICE_SUPERVISOR'"));
        assertFalse(expr.contains("'EVENT_COORDINATION_OFFICER'"));
    }
}
