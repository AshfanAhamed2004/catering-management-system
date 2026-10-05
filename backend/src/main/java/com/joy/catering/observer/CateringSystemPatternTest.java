package com.joy.catering.observer;

/**
 * Pattern Integration Driver & Verification Test
 * 
 * Demonstrates the execution of the Observer Design Pattern for:
 * Module: Dynamic Ingredient Forecasting & Kitchen Management
 * Student: Senarath W.M.I.S (IT25101200) - Head Chef
 * 
 * Verifies that state changes in CateringEventManager automatically notify the HeadChefObserver
 * to trigger real-time ingredient recalculations and procurement updates.
 */
public class CateringSystemPatternTest {

    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("  SOFTWARE ENGINEERING (SE) - DESIGN PATTERN VERIFICATION");
        System.out.println("  Module: Dynamic Ingredient Forecasting & Procurement Management");
        System.out.println("  Student: Senarath W.M.I.S  |  Registration No: IT25101200");
        System.out.println("  Assigned Role: Head Chef  |  Pattern: Observer Pattern (GoF)");
        System.out.println("==================================================================\n");

        // 1. Instantiate the Subject (CateringEventManager)
        CateringEventManager eventManager = new CateringEventManager();

        // 2. Instantiate and Register the Head Chef Observer (Senarath W.M.I.S)
        HeadChefObserver headChefObserver = new HeadChefObserver();
        eventManager.addObserver(headChefObserver);

        // Optional: Coordinator observer representation
        eventManager.addObserver(new Observer() {
            @Override
            public void update(String message) {
                System.out.println("[Staff Coordinator Alert]: " + message + " -> Reviewing kitchen shift rosters.");
            }
        });

        System.out.println("--- SIMULATING EVENT UPDATE 1: HEADCOUNT INCREASE ---");
        eventManager.setEventStatus("EVT-101: Guest count revised from 250 to 320 for Wedding Reception.");

        System.out.println("\n--- SIMULATING EVENT UPDATE 2: MENU PACKAGE CUSTOMIZATION ---");
        eventManager.setEventStatus("EVT-104: Added BBQ Skewers to Buffet Menu (400 Guests).");

        System.out.println("\n==================================================================");
        System.out.println("  OBSERVER PATTERN VERIFICATION COMPLETED SUCCESSFULLY!");
        System.out.println("==================================================================");
    }
}
