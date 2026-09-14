package com.catering.crm.service;

import java.util.ArrayList;
import java.util.List;

/**
 * Exception thrown when business or data validation fails.
 */
public class ValidationException extends Exception {
    private final List<String> errors;

    public ValidationException(String message) {
        super(message);
        this.errors = new ArrayList<>();
        this.errors.add(message);
    }

    public ValidationException(List<String> errors) {
        super(String.join("; ", errors));
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
