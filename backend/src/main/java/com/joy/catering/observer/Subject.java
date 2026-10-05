package com.joy.catering.observer;

/**
 * Subject Interface - Part of the Behavioral Observer Design Pattern.
 * 
 * Defines subscription management methods allowing department observers
 * to register, deregister, and receive synchronized event broadcasts.
 * 
 * Module: Dynamic Ingredient Forecasting & Kitchen Management
 * Author: Senarath W.M.I.S (IT25101200) - Head Chef
 */
public interface Subject {
    void addObserver(Observer observer);
    void removeObserver(Observer observer);
    void notifyObservers();
}
