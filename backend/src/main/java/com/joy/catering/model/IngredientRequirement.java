package com.joy.catering.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "ingredient_requirements", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"menu_item_id", "ingredientName"})
})
@Getter
@Setter
public class IngredientRequirement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false, length = 120)
    private String ingredientName;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal quantityPerGuest;

    @Column(nullable = false, length = 30)
    private String unit;
}
