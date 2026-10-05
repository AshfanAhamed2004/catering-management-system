package com.smartserve.staff.controller;

import com.smartserve.staff.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.ui.Model;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class Errors {

    private Object handle(int status, String message, HttpServletRequest request, HttpServletResponse response, Model model) {
        String accept = request.getHeader("Accept");
        boolean isApi = request.getRequestURI().startsWith("/api")
                || (accept != null && accept.contains(MediaType.APPLICATION_JSON_VALUE));

        if (isApi) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("status", status);
            body.put("message", message);
            return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).body(body);
        }

        response.setStatus(status);
        model.addAttribute("message", message);
        return "failure";
    }

    @ExceptionHandler(BusinessException.class)
    public Object business(BusinessException e, HttpServletRequest req, HttpServletResponse res, Model m) {
        return handle(e.status, e.getMessage(), req, res, m);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Object methodValidation(MethodArgumentNotValidException e, HttpServletRequest req, HttpServletResponse res, Model m) {
        String message = "Validation failed: " + e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .distinct()
                .collect(Collectors.joining("; "));
        return handle(400, message, req, res, m);
    }

    @ExceptionHandler(BindException.class)
    public Object validation(BindException e, HttpServletRequest req, HttpServletResponse res, Model m) {
        String message = "Please check your form: " + e.getFieldErrors().stream()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .distinct()
                .collect(Collectors.joining("; "));
        return handle(400, message, req, res, m);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public Object invalid(ConstraintViolationException e, HttpServletRequest req, HttpServletResponse res, Model m) {
        return handle(400, "Please check the required values and allowed ranges.", req, res, m);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public Object forbidden(AccessDeniedException e, HttpServletRequest req, HttpServletResponse res, Model m) {
        String message = e.getMessage() != null && !e.getMessage().isBlank() ? e.getMessage() : "Your account cannot access this action.";
        return handle(403, message, req, res, m);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, ObjectOptimisticLockingFailureException.class})
    public Object conflict(Exception e, HttpServletRequest req, HttpServletResponse res, Model m) {
        return handle(409, "This record conflicts with existing data. Refresh and review your request.", req, res, m);
    }

    @ExceptionHandler(Exception.class)
    public Object generic(Exception e, HttpServletRequest req, HttpServletResponse res, Model m) {
        return handle(500, "An unexpected server error occurred: " + e.getMessage(), req, res, m);
    }
}
