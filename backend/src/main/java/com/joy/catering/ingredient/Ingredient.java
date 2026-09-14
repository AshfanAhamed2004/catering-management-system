package com.joy.catering.ingredient;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entity representing an ingredient in the Catering Management System.
 */
@Entity
@Table(name = "ingredients")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String unit; // e.g., "kg", "liters", "grams"

    @Column(name = "stock_quantity", nullable = false)
    private double stockQuantity;

    @Column(name = "quantity_per_guest", nullable = false)
    private double quantityPerGuest; // Amount needed per single guest (e.g., 0.15 for 150g)

    // Default Constructor (required by JPA)
    public Ingredient() {
    }

    // Parameterized Constructor
    public Ingredient(Long id, String name, String unit, double stockQuantity, double quantityPerGuest) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.stockQuantity = stockQuantity;
        this.quantityPerGuest = quantityPerGuest;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public double getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(double stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public double getQuantityPerGuest() {
        return quantityPerGuest;
    }

    public void setQuantityPerGuest(double quantityPerGuest) {
        this.quantityPerGuest = quantityPerGuest;
    }
}