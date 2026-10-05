package com.joy.catering.observer;

/**
 * Observer Interface - Part of the Behavioral Observer Design Pattern.
 * 
 * Declares the update contract that all department observers must implement
 * to receive event lifecycle and guest count updates.
 * 
 * Module: Dynamic Ingredient Forecasting & Kitchen Management
 * Author: Senarath W.M.I.S (IT25101200) - Head Chef
 */
public interface Observer {
    void update(String message);
}
