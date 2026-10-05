package com.joy.catering.observer;

/**
 * Concrete Observer 1: Head Chef Observer
 * 
 * Represents the Head Chef department listener in the Observer Pattern.
 * Automatically triggered when event guest counts, menus, or statuses change,
 * prompting instant recalculation of raw ingredient requirements and procurement purchase orders.
 * 
 * Module: Dynamic Ingredient Forecasting & Kitchen Management
 * Student: Senarath W.M.I.S
 * Registration No: IT25101200
 * System Role: Head Chef
 */
public class HeadChefObserver implements Observer {

    @Override
    public void update(String message) {
        System.out.println("[Head Chef Alert]: " + message + " -> Recalculating ingredient forecasts.");
        // Automatically triggers recalculation of raw ingredient requirements
        // and procurement shortages based on updated event headcount.
        recalculateIngredientForecasts(message);
    }

    private void recalculateIngredientForecasts(String eventDetails) {
        // Business logic hook connecting event updates to Dynamic Ingredient Forecasting
        System.out.println("  [Forecast Engine]: Syncing baseline recipes with new guest headcount...");
        System.out.println("  [Procurement Engine]: Verifying warehouse inventory against required stock levels.");
    }
}
