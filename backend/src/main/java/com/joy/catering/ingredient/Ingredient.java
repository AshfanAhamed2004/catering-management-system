package com.joy.catering.ingredient;

public class Ingredient {

    private Long id;
    private String name;
    private double stockQuantity;
    private String unit; // e.g., "kg", "liters", "grams"

    // Default Constructor
    public Ingredient() {
    }

    // Parameterized Constructor
    public Ingredient(Long id, String name, double stockQuantity, String unit) {
        this.id = id;
        this.name = name;
        this.stockQuantity = stockQuantity;
        this.unit = unit;
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

    public double getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(double stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}