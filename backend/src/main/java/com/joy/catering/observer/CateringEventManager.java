package com.joy.catering.observer;

import java.util.ArrayList;
import java.util.List;

/**
 * Concrete Subject - CateringEventManager
 * 
 * Maintains a subscriber registry of departmental observers and broadcasts
 * notifications whenever booking details change (e.g., headcount increases,
 * menu adjustments, or event approvals).
 * 
 * Module: Dynamic Ingredient Forecasting & Kitchen Management
 * Author: Senarath W.M.I.S (IT25101200) - Head Chef
 */
public class CateringEventManager implements Subject {

    private final List<Observer> observers = new ArrayList<>();
    private String eventMessage;

    @Override
    public void addObserver(Observer observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
        }
    }

    @Override
    public void removeObserver(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(eventMessage);
        }
    }

    /**
     * Broadcast an event status change or guest count revision to all observers.
     * 
     * @param newStatus Message describing event update (e.g., headcount changes)
     */
    public void setEventStatus(String newStatus) {
        this.eventMessage = newStatus;
        notifyObservers();
    }

    public List<Observer> getObservers() {
        return observers;
    }
}
