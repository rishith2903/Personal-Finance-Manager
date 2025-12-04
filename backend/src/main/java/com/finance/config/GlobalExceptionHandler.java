package com.finance.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception e) {
        System.out.println("GlobalExceptionHandler: Caught exception: " + e.getClass().getName());
        System.out.println("GlobalExceptionHandler: Message: " + e.getMessage());
        e.printStackTrace();

        return ResponseEntity.status(500).body(Map.of(
                "error", e.getClass().getSimpleName(),
                "message", e.getMessage() != null ? e.getMessage() : "Unknown error",
                "details", "Check server logs for stack trace"));
    }
}
